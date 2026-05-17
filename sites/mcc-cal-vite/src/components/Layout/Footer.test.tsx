import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Footer from './Footer';

describe('Footer', () => {
  it('links directly to the accessibility and cookie policy sections', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo', { name: /site footer/i });

    expect(within(footer).getByRole('link', { name: 'Accessibility' })).toHaveAttribute(
      'href',
      '/accessibility',
    );
    expect(within(footer).getByRole('link', { name: 'Cookie Policy' })).toHaveAttribute(
      'href',
      '/accessibility#cookies-overview',
    );
  });
});
