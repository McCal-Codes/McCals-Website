import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

vi.stubEnv('PROD', true);
vi.stubEnv('VITE_VERCEL_ENV', 'production');

const { getOptimizedImageUrl, getResponsiveImageSrcSet } = await import('./imageOptimization');

describe('imageOptimization', () => {
  it('routes jsDelivr portfolio images through the Vercel image optimizer', () => {
    const originalUrl =
      'https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@main/src/images/Portfolios/Portrait/Studio/Jordan/photo.jpg';

    expect(getOptimizedImageUrl(originalUrl, { width: 640 })).toBe(
      '/_vercel/image?url=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2FMcCal-Codes%2FMcCals-Website%40main%2Fsrc%2Fimages%2FPortfolios%2FPortrait%2FStudio%2FJordan%2Fphoto.jpg&q=80&w=640',
    );
  });

  it('builds a responsive srcset for optimizable local images', () => {
    expect(getResponsiveImageSrcSet('/images/portraits-og.jpg', [384, 640])).toBe(
      '/_vercel/image?url=%2Fimages%2Fportraits-og.jpg&q=80&w=384 384w, /_vercel/image?url=%2Fimages%2Fportraits-og.jpg&q=80&w=640 640w',
    );
  });

  it('keeps every generated responsive portfolio width allowed by Vercel', () => {
    const vercelConfig = JSON.parse(
      readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8'),
    ) as { images?: { sizes?: number[] } };
    const generatedPortfolioWidths = [
      160,
      320,
      360,
      480,
      540,
      640,
      720,
      960,
      1080,
      1280,
      1440,
      1600,
      1920,
    ];

    expect(vercelConfig.images?.sizes).toEqual(
      expect.arrayContaining(generatedPortfolioWidths),
    );
  });
});
