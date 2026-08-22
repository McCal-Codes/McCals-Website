// @vitest-environment node

import type { ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

/**
 * Renders each page with no DOM present, which is what a prerender or any
 * server-side render would do.
 *
 * The failure this catches is cheap to introduce and expensive to find later:
 * reading `window` or `document` while rendering — most often in a `useState`
 * initializer, which looks like setup but runs on every render. A single
 * `useState(window.innerWidth <= 768)` in the shared Nav was enough to make every
 * page in the app unrenderable outside a browser.
 *
 * Runs in the node environment on purpose. Under the project default of jsdom,
 * `window` exists and this suite would pass without testing anything.
 *
 * Effects and layout effects do not run during `renderToString`, so browser APIs
 * used inside `useEffect` are fine and intentionally not flagged here.
 */

const PAGES: Array<{ route: string; load: () => Promise<{ default: ComponentType }> }> = [
  { route: '/', load: () => import('@/pages/index') },
  { route: '/about', load: () => import('@/pages/about') },
  { route: '/faq', load: () => import('@/pages/faq') },
  { route: '/accessibility', load: () => import('@/pages/accessibility') },
  { route: '/policies-legal', load: () => import('@/pages/policies-legal') },
  { route: '/licensing', load: () => import('@/pages/licensing') },
  { route: '/privacy', load: () => import('@/pages/privacy') },
  { route: '/terms', load: () => import('@/pages/terms') },
  { route: '/contact-us', load: () => import('@/pages/contact-us') },
  { route: '/journalism', load: () => import('@/pages/journalism') },
  { route: '/portraits', load: () => import('@/pages/portraits') },
  { route: '/nature', load: () => import('@/pages/nature') },
];

function renderPage(Page: ComponentType, route: string): string {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderToString(
    <QueryClientProvider client={queryClient}>
      {/* MemoryRouter, not StaticRouter: it resolves to the same module instance as the
          useLocation() these pages call, so the router context matches. */}
      <MemoryRouter initialEntries={[route]}>
        <Page />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('server-side rendering safety', () => {
  it('has no DOM globals, so these assertions are meaningful', () => {
    expect(typeof window, 'this suite must run in the node environment').toBe('undefined');
  });

  it.each(PAGES)('renders $route without a DOM', async ({ route, load }) => {
    const { default: Page } = await load();
    expect(() => renderPage(Page, route)).not.toThrow();
  });

  it.each(PAGES)('$route produces real markup, not an empty shell', async ({ route, load }) => {
    const { default: Page } = await load();
    const html = renderPage(Page, route);
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    // A component can render without throwing and still emit nothing useful — for
    // example if its content is gated behind a browser-only check.
    expect(text.length, `${route} rendered almost no text`).toBeGreaterThan(200);
  });
});
