import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
