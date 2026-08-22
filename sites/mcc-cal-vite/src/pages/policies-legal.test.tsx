import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import PoliciesLegalPage from './policies-legal';

/**
 * The hub replaced a 1,075-line page that held every legal document at once. Its job
 * now is to route people onward, and to keep the old `#license`, `#privacy` and
 * `#terms` fragments landing somewhere useful — those are linked from outside the
 * site and cannot be redirected, because fragments never reach the server.
 */
describe('PoliciesLegalPage (hub)', () => {
  function renderHub() {
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <PoliciesLegalPage />
      </MemoryRouter>,
    );
  }

  it.each([
    ['Image Licensing', '/licensing'],
    ['Privacy & Cookies', '/privacy'],
    ['Terms & Conditions', '/terms'],
  ])('links to %s', (name, href) => {
    renderHub();
    expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
  });

  it('keeps the anchors the combined page used, so old fragment links still land', () => {
    const { container } = render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <PoliciesLegalPage />
      </MemoryRouter>,
    );
    for (const id of ['license', 'privacy', 'terms']) {
      expect(container.querySelector(`#${id}`), `#${id} should still exist`).not.toBeNull();
    }
  });
});
