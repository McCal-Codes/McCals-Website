import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import HeroCarousel from './HeroCarousel.lazy';

describe('HeroCarousel', () => {
  it('keeps the old visual carousel structure with accessible controls', () => {
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <HeroCarousel />
      </MemoryRouter>,
    );

    const carousel = screen.getByRole('region', { name: 'Featured photography' });

    expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');
    expect(
      within(carousel).getByRole('heading', {
        level: 1,
        name: 'Pittsburgh photographer Caleb McCartney',
      }),
    ).toBeInTheDocument();
    expect(within(carousel).queryByRole('heading', { name: 'Loading...' })).not.toBeInTheDocument();

    expect(within(carousel).getByRole('link', { name: 'View Pittsburgh' })).toHaveAttribute(
      'href',
      '/nature',
    );
    expect(within(carousel).getByRole('button', { name: 'Previous slide' })).toHaveAttribute(
      'type',
      'button',
    );
    expect(within(carousel).getByRole('button', { name: 'Next slide' })).toHaveAttribute(
      'type',
      'button',
    );

    const firstDot = within(carousel).getByRole('button', { name: 'Go to Pittsburgh' });
    expect(firstDot).toHaveAttribute('aria-current', 'true');
    expect(firstDot).toHaveAttribute('type', 'button');
    expect(within(carousel).getByRole('button', { name: 'Go to Politics' })).toHaveAttribute(
      'aria-current',
      'false',
    );

    const firstImage = within(carousel).getByRole('img', { name: /steel truss bridge/i });
    expect(firstImage).toHaveAttribute('loading', 'eager');
    expect(firstImage).toHaveAttribute('fetchpriority', 'high');
    expect(firstImage).toHaveAttribute('decoding', 'async');
    expect(firstImage).toHaveAttribute('sizes', '100vw');
    expect(firstImage).toHaveAttribute('width', '1920');
    expect(firstImage).toHaveAttribute('height', '1280');
  });
});
