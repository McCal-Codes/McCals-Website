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
    render(
      <PortfolioCard
        group={mockGroup}
        onOpen={() => {}}
        onCopyLink={() => {}}
      />
    );

    expect(screen.getByText('Test Concert')).toBeInTheDocument();
  });

  it('renders the date display', () => {
    render(
      <PortfolioCard
        group={mockGroup}
        onOpen={() => {}}
        onCopyLink={() => {}}
      />
    );

    expect(
      screen.getByText(/January 2025/, { hidden: true })
    ).toBeInTheDocument();
  });

  it('has accessible role and keyboard support', () => {
    render(
      <PortfolioCard
        group={mockGroup}
        onOpen={() => {}}
        onCopyLink={() => {}}
      />
    );

    const card = screen.getByRole('button', {
      name: /View Test Concert photos/i,
    });
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('opens the portfolio from click and keyboard interactions', () => {
    const onOpen = vi.fn();

    render(
      <PortfolioCard
        group={mockGroup}
        onOpen={onOpen}
        onCopyLink={() => {}}
      />
    );

    const card = screen.getByRole('button', {
      name: /View Test Concert photos/i,
    });

    fireEvent.click(card);
    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });

    expect(onOpen).toHaveBeenCalledTimes(3);
    expect(onOpen).toHaveBeenCalledWith(mockGroup);
  });

  it('prevents casual save interactions on the protected image layer', () => {
    render(
      <PortfolioCard
        group={mockGroup}
        onOpen={() => {}}
        onCopyLink={() => {}}
      />
    );

    const protectionLayer = screen.getByTestId('portfolio-image-protection');
    const coverImage = screen.getByAltText('Test concert photo 1');

    expect(protectionLayer).toHaveAttribute('aria-hidden', 'true');
    expect(coverImage).toHaveAttribute('draggable', 'false');
    expect(fireEvent.contextMenu(protectionLayer)).toBe(false);
    expect(fireEvent.dragStart(protectionLayer)).toBe(false);
  });

  it('displays image count correctly', () => {
    render(
      <PortfolioCard
        group={mockGroup}
        onOpen={() => {}}
        onCopyLink={() => {}}
      />
    );

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
      />
    );

    expect(screen.getByText('Commencement', { hidden: true })).toBeInTheDocument();
    expect(screen.getByText('University Event', { hidden: true })).toBeInTheDocument();
    expect(screen.getAllByText('Graduation', { hidden: true })).toHaveLength(1);
  });
});
