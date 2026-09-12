import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FeaturedPortfolio from './FeaturedPortfolio';

/**
 * /featured-work is a sequence of single photographs. What matters here is the
 * rhythm (one wide frame, then two paired), that every frame carries its own
 * caption and links only to a plain gallery route, and that alt stays empty
 * when the caption beside the image already says the same thing.
 */

const WIDE = { width: 2400, height: 1600 };
const TALL = { width: 1600, height: 2400 };

function frame(overrides: Record<string, unknown> = {}) {
  return {
    path: 'Journalism/Politics/a/one.jpg',
    title: 'One',
    caption: 'A first caption. (Photo by Caleb McCartney)',
    alt: '',
    date: '2024-10-05',
    dateDisplay: 'Oct. 5, 2024',
    category: 'Photojournalism',
    album: '/journalism',
    ...WIDE,
    ...overrides,
  };
}

const manifestState = vi.hoisted(() => ({
  value: {
    status: 'success',
    error: null,
    data: { frames: [] as unknown[] },
  } as { status: string; error: string | null; data: { frames: unknown[] } | null },
}));

vi.mock('../portfolio/useManifest', () => ({
  useManifest: () => manifestState.value,
  imageUrl: {
    featured: (folder: string, filename: string) => `/src/images/Portfolios/${folder}/${filename}`,
  },
}));

const trackImageView = vi.hoisted(() => vi.fn());
vi.mock('@/utils/funnel', () => ({ trackImageView }));

function setFrames(frames: unknown[]) {
  manifestState.value = { status: 'success', error: null, data: { frames } };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <FeaturedPortfolio />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  trackImageView.mockClear();
  setFrames([frame()]);
});

describe('FeaturedPortfolio', () => {
  it('heads the page with an h1', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders one figure per curated frame, in the curated order', () => {
    setFrames([
      frame({ path: 'a/1.jpg', title: 'First', caption: 'Caption one.' }),
      frame({ path: 'a/2.jpg', title: 'Second', caption: 'Caption two.' }),
      frame({ path: 'a/3.jpg', title: 'Third', caption: 'Caption three.' }),
    ]);
    renderPage();

    const figures = screen.getAllByRole('group');
    expect(figures).toHaveLength(3);
    expect(figures[0]).toHaveTextContent('Caption one.');
    expect(figures[1]).toHaveTextContent('Caption two.');
    expect(figures[2]).toHaveTextContent('Caption three.');
  });

  it('alternates one wide frame with two paired frames', () => {
    setFrames(Array.from({ length: 6 }, (_, i) => frame({ path: `a/${i}.jpg`, title: `F${i}` })));
    const { container } = renderPage();

    const rows = Array.from(container.querySelectorAll('figure')).map(
      (figure) => figure.parentElement,
    );
    const uniqueRows: Element[] = [];
    for (const row of rows) {
      if (row && !uniqueRows.includes(row)) uniqueRows.push(row);
    }

    // 6 frames -> wide, pair, wide, pair: four rows holding 1, 2, 1, 2.
    expect(uniqueRows.map((row) => row.querySelectorAll('figure').length)).toEqual([1, 2, 1, 2]);
  });

  it('gives a trailing odd frame a row of its own rather than a lonely half', () => {
    setFrames(Array.from({ length: 5 }, (_, i) => frame({ path: `a/${i}.jpg`, title: `F${i}` })));
    const { container } = renderPage();

    const counts = Array.from(container.querySelectorAll('figure'))
      .map((figure) => figure.parentElement)
      .filter((row, index, all) => row && all.indexOf(row) === index)
      .map((row) => row!.querySelectorAll('figure').length);

    expect(counts).toEqual([1, 2, 1, 1]);
  });

  it('labels each figure by its own caption', () => {
    renderPage();
    const figure = screen.getByRole('group');
    const labelId = figure.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    expect(figure.querySelector(`#${labelId}`)).toHaveTextContent('A first caption.');
  });

  it('leaves alt empty when the caption beside the image carries the content', () => {
    const { container } = renderPage();
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img!.getAttribute('alt')).toBe('');
  });

  it('uses a per-frame alt when the curation file supplies one', () => {
    setFrames([frame({ alt: 'Described beyond the caption.' })]);
    const { container } = renderPage();
    expect(container.querySelector('img')!.getAttribute('alt')).toBe(
      'Described beyond the caption.',
    );
  });

  it('links a frame to a plain gallery route, with no fragment', () => {
    renderPage();
    const link = within(screen.getByRole('group')).getByRole('link');
    expect(link).toHaveAttribute('href', '/journalism');
    expect(link.getAttribute('href')).not.toContain('#');
  });

  it('renders no link for a frame with no album', () => {
    setFrames([frame({ album: '' })]);
    renderPage();
    expect(within(screen.getByRole('group')).queryByRole('link')).toBeNull();
  });

  it('keeps the caption link outside the image button, so no control nests inside another', () => {
    renderPage();
    const button = within(screen.getByRole('group')).getByRole('button');
    expect(button.querySelector('a, button, [tabindex]')).toBeNull();
  });

  it('marks only the first photograph high priority and lazy-loads the rest', () => {
    setFrames([frame({ path: 'a/1.jpg' }), frame({ path: 'a/2.jpg' }), frame({ path: 'a/3.jpg' })]);
    const { container } = renderPage();
    const images = Array.from(container.querySelectorAll('img'));

    expect(images[0]).toHaveAttribute('fetchpriority', 'high');
    expect(images[0]).toHaveAttribute('loading', 'eager');
    for (const img of images.slice(1)) {
      expect(img).not.toHaveAttribute('fetchpriority');
      expect(img).toHaveAttribute('loading', 'lazy');
    }
  });

  it('carries intrinsic width and height so the row reserves space before loading', () => {
    setFrames([frame(TALL)]);
    const { container } = renderPage();
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('width', '1600');
    expect(img).toHaveAttribute('height', '2400');
  });

  it('requests only widths present in the vercel.json allowlist', () => {
    const allowed = new Set([
      160, 320, 360, 480, 540, 640, 720, 960, 1080, 1280, 1440, 1600, 1920, 2048, 3840,
    ]);
    setFrames([frame({ path: 'a/1.jpg' }), frame({ path: 'a/2.jpg' }), frame({ path: 'a/3.jpg' })]);
    const { container } = renderPage();

    for (const img of Array.from(container.querySelectorAll('img'))) {
      for (const candidate of (img.getAttribute('srcset') ?? '').split(',')) {
        const width = Number.parseInt(candidate.trim().split(/\s+/)[1] ?? '', 10);
        if (Number.isFinite(width)) expect(allowed).toContain(width);
      }
    }
  });

  it('announces a load failure and offers a way on, rather than printing the raw error quietly', () => {
    manifestState.value = {
      status: 'error',
      error: 'featured-manifest.json 404',
      data: null,
    };
    renderPage();

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('could not be loaded');
    expect(within(alert).getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('says so when nothing is curated yet', () => {
    setFrames([]);
    renderPage();
    expect(screen.queryAllByRole('group')).toHaveLength(0);
    expect(screen.getByText(/no photographs are selected yet/i)).toBeInTheDocument();
  });
});
