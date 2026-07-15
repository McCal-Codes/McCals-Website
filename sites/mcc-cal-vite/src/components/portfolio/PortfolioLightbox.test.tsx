import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import PortfolioLightbox from './PortfolioLightbox';
import type { PortfolioGroup } from './types';

const images = [
  { url: '/images/test/one.jpg', filename: 'one.jpg', alt: 'First photo' },
  { url: '/images/test/two.jpg', filename: 'two.jpg', alt: 'Second photo' },
  { url: '/images/test/three.jpg', filename: 'three.jpg', alt: 'Third photo' },
];

const group: PortfolioGroup = {
  id: 'test-group',
  title: 'Test Gallery',
  dateDisplay: 'June 2026',
  category: 'Events',
  images,
  coverImage: images[0],
};

const nextImages = [
  { url: '/images/test/four.jpg', filename: 'four.jpg', alt: 'Fourth photo' },
];

const nextGroup: PortfolioGroup = {
  id: 'next-group',
  title: 'Next Gallery',
  dateDisplay: 'July 2026',
  category: 'Events',
  images: nextImages,
  coverImage: nextImages[0],
};

/* jsdom has no PointerEvent, so fired pointer events would drop clientX/pointerType. */
class PointerEventPolyfill extends MouseEvent {
  pointerId: number;
  pointerType: string;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 0;
    this.pointerType = init.pointerType ?? '';
  }
}

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => true);
  window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
});

function getStageImage(): HTMLImageElement {
  return screen.getByAltText('First photo') as HTMLImageElement;
}

function getStageFrame(): HTMLElement {
  return getStageImage().closest('[data-orientation]') as HTMLElement;
}

function getStageScroller(): HTMLElement {
  return getStageImage().closest('[data-zoomed]') as HTMLElement;
}

describe('PortfolioLightbox', () => {
  it('renders the dialog with the group title and photo counter', () => {
    render(<PortfolioLightbox group={group} onClose={() => {}} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Test Gallery' })).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows an error state with retry when the image fails, and retries on click', () => {
    render(<PortfolioLightbox group={group} onClose={() => {}} />);

    fireEvent.error(getStageImage());

    expect(screen.getByRole('alert')).toHaveTextContent('This photo could not be loaded.');
    const retry = screen.getByRole('button', { name: 'Try again' });

    fireEvent.click(retry);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Loading photo');
    expect(getStageImage()).toBeInTheDocument();
  });

  it('fits the active image without forcing both dimensions and changing its aspect ratio', () => {
    render(<PortfolioLightbox group={group} onClose={() => {}} />);

    const image = getStageImage();

    expect(image).toHaveStyle({ width: '100%', height: 'auto' });
  });

  it('keeps portrait images in a height-fit portrait frame', () => {
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, 1200, 700));

    try {
      render(<PortfolioLightbox group={group} onClose={() => {}} />);

      const image = getStageImage();
      Object.defineProperty(image, 'naturalWidth', { configurable: true, value: 800 });
      Object.defineProperty(image, 'naturalHeight', { configurable: true, value: 1200 });

      fireEvent.load(image);

      const frame = image.closest('[data-orientation]') as HTMLElement;

      expect(frame).toHaveAttribute('data-orientation', 'portrait');
      expect(frame).toHaveAttribute('data-fit', 'height');
      expect(frame.style.aspectRatio).toBe('0.6666666666666666 / 1');
      expect(image).toHaveStyle({ width: 'auto', height: '100%' });
    } finally {
      getBoundingClientRect.mockRestore();
    }
  });

  it('keeps zoom buttons focusable at their bounds via aria-disabled instead of disabled', () => {
    render(<PortfolioLightbox group={group} onClose={() => {}} />);

    const zoomOut = screen.getByRole('button', { name: 'Zoom out' });
    const zoomIn = screen.getByRole('button', { name: 'Zoom in' });

    expect(zoomOut).toHaveAttribute('aria-disabled', 'true');
    expect(zoomOut).not.toBeDisabled();

    fireEvent.click(zoomOut);
    expect(screen.getByText('100%')).toBeInTheDocument();

    fireEvent.click(zoomIn);
    expect(screen.getByText('150%')).toBeInTheDocument();
    expect(zoomOut).toHaveAttribute('aria-disabled', 'false');

    fireEvent.click(zoomIn);
    fireEvent.click(zoomIn);
    expect(screen.getByText('250%')).toBeInTheDocument();
    expect(zoomIn).toHaveAttribute('aria-disabled', 'true');
    expect(zoomIn).not.toBeDisabled();

    fireEvent.click(zoomIn);
    expect(screen.getByText('250%')).toBeInTheDocument();
  });

  it('exposes quiet shortcut hints for desktop lightbox controls', () => {
    render(<PortfolioLightbox group={group} onClose={() => {}} />);

    expect(screen.getByRole('button', { name: 'Zoom out' })).toHaveAttribute('aria-keyshortcuts', '-');
    expect(screen.getByRole('button', { name: 'Zoom in' })).toHaveAttribute('title', 'Zoom in (+)');
    expect(screen.getByRole('button', { name: 'Reset zoom' })).toHaveAttribute('aria-keyshortcuts', '0');
    expect(screen.getByRole('button', { name: 'Close lightbox' })).toHaveAttribute('title', 'Close (Esc)');
    expect(screen.getByRole('button', { name: 'Previous photo' })).toHaveAttribute('aria-keyshortcuts', 'ArrowLeft PageUp');
    expect(screen.getByRole('button', { name: 'Next photo' })).toHaveAttribute('title', 'Next photo (Right arrow)');
    expect(getStageFrame()).toHaveAttribute('title', 'Double-click or pinch to zoom in');
  });

  it('navigates photos with arrow keys and resets zoom on navigation', () => {
    render(<PortfolioLightbox group={group} onClose={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(screen.getByText('150%')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'ArrowRight' });

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByAltText('Second photo')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByAltText('First photo')).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<PortfolioLightbox group={group} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('navigates on a horizontal touch swipe when not zoomed', () => {
    render(<PortfolioLightbox group={group} onClose={() => {}} />);

    const frame = getStageFrame();

    fireEvent.pointerDown(frame, { pointerId: 1, pointerType: 'touch', clientX: 300, clientY: 200 });
    fireEvent.pointerUp(frame, { pointerId: 1, pointerType: 'touch', clientX: 180, clientY: 210 });

    expect(screen.getByAltText('Second photo')).toBeInTheDocument();
  });

  it('does not treat a small touch movement as a swipe', () => {
    render(<PortfolioLightbox group={group} onClose={() => {}} />);

    const frame = getStageFrame();

    fireEvent.pointerDown(frame, { pointerId: 1, pointerType: 'touch', clientX: 300, clientY: 200 });
    fireEvent.pointerUp(frame, { pointerId: 1, pointerType: 'touch', clientX: 280, clientY: 205 });

    expect(screen.getByAltText('First photo')).toBeInTheDocument();
  });

  it('supports two-finger pinch zoom without changing photos', () => {
    render(<PortfolioLightbox group={group} onClose={() => {}} />);

    const frame = getStageFrame();

    fireEvent.pointerDown(frame, { pointerId: 1, pointerType: 'touch', clientX: 100, clientY: 100 });
    fireEvent.pointerDown(frame, { pointerId: 2, pointerType: 'touch', clientX: 200, clientY: 100 });
    fireEvent.pointerMove(frame, { pointerId: 1, pointerType: 'touch', clientX: 75, clientY: 100 });
    fireEvent.pointerMove(frame, { pointerId: 2, pointerType: 'touch', clientX: 225, clientY: 100 });

    expect(screen.getByText('150%')).toBeInTheDocument();
    expect(screen.getByAltText('First photo')).toBeInTheDocument();

    fireEvent.pointerUp(frame, { pointerId: 1, pointerType: 'touch', clientX: 100, clientY: 100 });
    fireEvent.pointerUp(frame, { pointerId: 2, pointerType: 'touch', clientX: 250, clientY: 100 });
  });

  it('supports two-finger pinch zooming back out', () => {
    render(<PortfolioLightbox group={group} onClose={() => {}} />);

    const frame = getStageFrame();

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(screen.getByText('200%')).toBeInTheDocument();

    fireEvent.pointerDown(frame, { pointerId: 1, pointerType: 'touch', clientX: 100, clientY: 100 });
    fireEvent.pointerDown(frame, { pointerId: 2, pointerType: 'touch', clientX: 300, clientY: 100 });
    fireEvent.pointerMove(frame, { pointerId: 1, pointerType: 'touch', clientX: 150, clientY: 100 });
    fireEvent.pointerMove(frame, { pointerId: 2, pointerType: 'touch', clientX: 250, clientY: 100 });

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByAltText('First photo')).toBeInTheDocument();
  });

  it('toggles zoom with a double click on the photo area', () => {
    render(<PortfolioLightbox group={group} onClose={() => {}} />);

    const image = getStageImage();

    fireEvent.doubleClick(image, { clientX: 150, clientY: 150 });

    expect(screen.getByText('200%')).toBeInTheDocument();

    fireEvent.doubleClick(image, { clientX: 150, clientY: 150 });

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('navigates photos with a two-finger horizontal swipe when not zoomed', () => {
    render(<PortfolioLightbox group={group} onClose={() => {}} />);

    const frame = getStageFrame();

    fireEvent.pointerDown(frame, { pointerId: 1, pointerType: 'touch', clientX: 100, clientY: 100 });
    fireEvent.pointerDown(frame, { pointerId: 2, pointerType: 'touch', clientX: 200, clientY: 100 });
    fireEvent.pointerMove(frame, { pointerId: 1, pointerType: 'touch', clientX: 40, clientY: 100 });
    fireEvent.pointerMove(frame, { pointerId: 2, pointerType: 'touch', clientX: 140, clientY: 100 });
    fireEvent.pointerUp(frame, { pointerId: 1, pointerType: 'touch', clientX: 40, clientY: 100 });

    expect(screen.getByAltText('Second photo')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('does not navigate photos when a two-finger gesture is cancelled', () => {
    render(<PortfolioLightbox group={group} onClose={() => {}} />);

    const frame = getStageFrame();

    fireEvent.pointerDown(frame, { pointerId: 1, pointerType: 'touch', clientX: 100, clientY: 100 });
    fireEvent.pointerDown(frame, { pointerId: 2, pointerType: 'touch', clientX: 200, clientY: 100 });
    fireEvent.pointerMove(frame, { pointerId: 1, pointerType: 'touch', clientX: 40, clientY: 100 });
    fireEvent.pointerMove(frame, { pointerId: 2, pointerType: 'touch', clientX: 140, clientY: 100 });
    fireEvent.pointerCancel(frame, { pointerId: 1, pointerType: 'touch', clientX: 40, clientY: 100 });

    expect(screen.getByAltText('First photo')).toBeInTheDocument();
  });

  it('navigates photos with horizontal wheel gestures when not zoomed', () => {
    render(<PortfolioLightbox group={group} onClose={() => {}} />);

    const scroller = getStageScroller();

    fireEvent.wheel(scroller, { deltaX: 72, deltaY: 4 });

    expect(screen.getByAltText('Second photo')).toBeInTheDocument();
  });

  it('zooms the photo area with trackpad pinch wheel gestures', () => {
    render(<PortfolioLightbox group={group} onClose={() => {}} />);

    const scroller = getStageScroller();

    expect(fireEvent.wheel(scroller, { ctrlKey: true, deltaY: -120, clientX: 150, clientY: 150 })).toBe(false);

    expect(screen.getByText('200%')).toBeInTheDocument();
    expect(screen.getByAltText('First photo')).toBeInTheDocument();

    expect(fireEvent.wheel(scroller, { ctrlKey: true, deltaY: 120, clientX: 150, clientY: 150 })).toBe(false);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('continues into the next gallery when advancing past the last photo', () => {
    const onChangeGroup = vi.fn();

    render(
      <PortfolioLightbox
        group={group}
        collection={[group, nextGroup]}
        initialIndex={2}
        onChangeGroup={onChangeGroup}
        onClose={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next photo' }));

    expect(onChangeGroup).toHaveBeenCalledWith(nextGroup, 0);
  });
});
