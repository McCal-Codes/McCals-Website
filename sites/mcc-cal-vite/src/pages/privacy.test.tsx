import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import PrivacyPage from './privacy';

/**
 * The cookie disclosure moved here when the combined policies page was split. These
 * assertions came with it, they were previously part of the policies-legal test.
 */
describe('PrivacyPage', () => {
  it('links out to the accessibility and cookie policy', () => {
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <PrivacyPage />
      </MemoryRouter>,
    );

    expect(
      screen
        .getAllByRole('link', { name: 'Accessibility & Cookie Policy' })
        .some((link) => link.getAttribute('href') === '/accessibility'),
    ).toBe(true);
    expect(
      screen.getByRole('link', { name: 'View Accessibility & Cookie Policy' }),
    ).toHaveAttribute('href', '/accessibility');
  });

  it('covers both privacy and cookies, so neither needs a page of its own', () => {
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <PrivacyPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /Privacy Policy/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Cookie Policy/i })).toBeInTheDocument();
  });
});
