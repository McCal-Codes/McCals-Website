import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AccessibilityPage from './accessibility';

describe('AccessibilityPage', () => {
  afterEach(() => {
    history.replaceState(null, '', '/');
    vi.clearAllMocks();
    delete (Element.prototype as Partial<Element>).scrollIntoView;
  });

  it('renders the accessibility and cookie policy content', async () => {
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <AccessibilityPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Accessibility & Cookie Policy',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Cookie Preference Center',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Cookie Settings',
      }),
    ).toHaveAttribute('href', '#cookie-settings');
  });

  it('scrolls to a cookie section when opened with a hash link', async () => {
    history.replaceState(null, '', '/accessibility#cookies-overview');
    const scrollIntoView = vi.fn();
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <AccessibilityPage />
      </MemoryRouter>,
    );

    await screen.findByRole('heading', {
      name: 'What Are Cookies?',
    });

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });
});
