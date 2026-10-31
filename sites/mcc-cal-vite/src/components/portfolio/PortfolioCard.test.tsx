import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import PortfolioCard from './PortfolioCard';
import type { PortfolioGroup } from './types';

const mockGroup: PortfolioGroup = {
  id: 'test-concert',
  title: 'Test Concert',
  dateDisplay: 'January 2025',
  dateISO: '2025-01-01',
  category: 'Concert',
  images: [
    { url: '/test1.jpg', filename: 'test1.jpg', alt: 'Test concert photo 1' },
    { url: '/test2.jpg', filename: 'test2.jpg', alt: 'Test concert photo 2' },
  ],
  coverImage: { url: '/test1.jpg', filename: 'test1.jpg', alt: 'Test concert photo 1' },
};

describe('PortfolioCard', () => {
  it('renders the portfolio title', () => {
    render(<PortfolioCard group={mockGroup} onOpen={() => {}} onCopyLink={() => {}} />);

    expect(screen.getByText('Test Concert')).toBeInTheDocument();
  });

  it('renders the date display', () => {
    render(<PortfolioCard group={mockGroup} onOpen={() => {}} onCopyLink={() => {}} />);

    expect(screen.getByText(/January 2025/)).toBeInTheDocument();
  });

  /**
   * The card was an <article role="button" tabindex="0"> wrapping the copy-link
   * <button>. axe reports that as nested-interactive, and it is a real problem
   * rather than a technicality: a keyboard user met two overlapping controls
   * with no way to tell which was which, and the outer one reimplemented Enter
   * and Space by hand.
   *
   * The action is a real <button> now, so the browser gives it focus and key
   * handling. These assertions pin the shape rather than the reimplementation.
   */
  it('exposes the open action as a real button, not a div with a role', () => {
    render(<PortfolioCard group={mockGroup} onOpen={() => {}} onCopyLink={() => {}} />);

    const open = screen.getByRole('button', { name: /View Test Concert photos/i });

    // A native button is focusable without an explicit tabindex, and gets
    // Enter and Space from the browser rather than from a keydown handler.
    expect(open.tagName).toBe('BUTTON');
    expect(open).not.toHaveAttribute('tabindex');
  });

  it('does not nest one control inside another', () => {
    const { container } = render(
      <PortfolioCard group={mockGroup} onOpen={() => {}} onCopyLink={() => {}} />,
    );

    const focusableSelector = 'a[href], button, input, select, textarea, [tabindex]';
    for (const control of container.querySelectorAll(focusableSelector)) {
      expect(control.querySelector(focusableSelector)).toBeNull();
    }

    // The container itself must not claim to be a control either.
    const card = container.querySelector('article');
    expect(card).not.toHaveAttribute('role', 'button');
    expect(card).not.toHaveAttribute('tabindex');
  });

  it('opens the portfolio when its button is activated', () => {
    const onOpen = vi.fn();

    render(<PortfolioCard group={mockGroup} onOpen={onOpen} onCopyLink={() => {}} />);

    const open = screen.getByRole('button', { name: /View Test Concert photos/i });

    // Only click is asserted. jsdom does not turn Enter or Space on a native
    // button into a click the way a browser does, so asserting keydown here
    // would be testing jsdom rather than the card. What makes the keyboard work
    // is that this is a real button, which the test above pins.
    fireEvent.click(open);

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(mockGroup);
  });

  it('prevents casual save interactions on the protected image layer', () => {
    render(<PortfolioCard group={mockGroup} onOpen={() => {}} onCopyLink={() => {}} />);

    const protectionLayer = screen.getByTestId('portfolio-image-protection');
    const coverImage = screen.getByAltText('Test concert photo 1');

    expect(protectionLayer).toHaveAttribute('aria-hidden', 'true');
    expect(coverImage).toHaveAttribute('draggable', 'false');
    expect(fireEvent.contextMenu(protectionLayer)).toBe(false);
    expect(fireEvent.dragStart(protectionLayer)).toBe(false);
  });

  it('displays image count correctly', () => {
    render(<PortfolioCard group={mockGroup} onOpen={() => {}} onCopyLink={() => {}} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders detail tags without repeating the category', () => {
    render(
      <PortfolioCard
        group={{
          ...mockGroup,
          category: 'Graduation',
          tags: ['Graduation', 'Commencement', 'University Event'],
        }}
        onOpen={() => {}}
        onCopyLink={() => {}}
      />,
    );

    expect(screen.getByText('Commencement')).toBeInTheDocument();
    expect(screen.getByText('University Event')).toBeInTheDocument();
    expect(screen.getAllByText('Graduation')).toHaveLength(1);
  });
});
