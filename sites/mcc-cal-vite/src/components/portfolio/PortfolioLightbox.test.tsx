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
  window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
});

function getStageImage(): HTMLImageElement {
  return screen.getByAltText('First photo') as HTMLImageElement;
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

    const scroller = getStageImage().closest('[data-zoomed]') as HTMLElement;

    fireEvent.pointerDown(scroller, { pointerId: 1, pointerType: 'touch', clientX: 300, clientY: 200 });
    fireEvent.pointerUp(scroller, { pointerId: 1, pointerType: 'touch', clientX: 180, clientY: 210 });

    expect(screen.getByAltText('Second photo')).toBeInTheDocument();
  });

  it('does not treat a small touch movement as a swipe', () => {
    render(<PortfolioLightbox group={group} onClose={() => {}} />);

    const scroller = getStageImage().closest('[data-zoomed]') as HTMLElement;

    fireEvent.pointerDown(scroller, { pointerId: 1, pointerType: 'touch', clientX: 300, clientY: 200 });
    fireEvent.pointerUp(scroller, { pointerId: 1, pointerType: 'touch', clientX: 280, clientY: 205 });

    expect(screen.getByAltText('First photo')).toBeInTheDocument();
  });
});
