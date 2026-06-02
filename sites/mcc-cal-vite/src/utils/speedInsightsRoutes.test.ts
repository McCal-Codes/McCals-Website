import { describe, expect, it } from 'vitest';
import { getSpeedInsightsRoute } from './speedInsightsRoutes';

describe('getSpeedInsightsRoute', () => {
  it('keeps static public routes stable', () => {
    expect(getSpeedInsightsRoute('/')).toBe('/');
    expect(getSpeedInsightsRoute('/journalism')).toBe('/journalism');
    expect(getSpeedInsightsRoute('/events/')).toBe('/events');
  });

  it('normalizes dynamic routes', () => {
    expect(getSpeedInsightsRoute('/blog/fear-of-emotion')).toBe('/blog/[slug]');
    expect(getSpeedInsightsRoute('/authors/mccal')).toBe('/authors/[authorId]');
  });

  it('labels redirects and unknown routes without fragmenting metrics', () => {
    expect(getSpeedInsightsRoute('/contact')).toBe('/redirect');
    expect(getSpeedInsightsRoute('/schedule')).toBe('/redirect');
    expect(getSpeedInsightsRoute('/not-a-real-page')).toBe('/404');
  });
});
