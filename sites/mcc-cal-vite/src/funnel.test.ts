import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const trackMock = vi.hoisted(() => vi.fn());
const gaEventMock = vi.hoisted(() => vi.fn());

vi.mock('@vercel/analytics/react', () => ({ track: trackMock }));
vi.mock('@/utils/ga4', () => ({
  gaEvent: gaEventMock,
  isGa4Enabled: () => true,
}));

const CONSENT_KEY = 'mccal_cookie_consent';

/**
 * The funnel exists so drop-off is visible; these assertions pin the event
 * names and the consent gate, because a renamed event fails silently in
 * analytics rather than loudly in code.
 */
describe('funnel instrumentation', () => {
  beforeEach(() => {
    vi.resetModules();
    trackMock.mockClear();
    gaEventMock.mockClear();
    window.localStorage.clear();
    // trackWebsiteEvent no-ops outside production, which would make every
    // assertion below vacuous.
    vi.stubEnv('PROD', true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    window.localStorage.clear();
  });

  it('uses GA4 recommended generate_lead rather than a custom name', async () => {
    const { trackLead } = await import('@/utils/funnel');
    trackLead('quote', { service_type: 'Event Photography' });

    expect(trackMock).toHaveBeenCalledWith('generate_lead', {
      lead_source: 'quote',
      service_type: 'Event Photography',
    });
  });

  it('records which step a multi-step form reached, and the direction', async () => {
    const { trackFormStep } = await import('@/utils/funnel');
    trackFormStep('quote', 2, 'forward');

    expect(trackMock).toHaveBeenCalledWith('form_step', {
      form_name: 'quote',
      step: 2,
      direction: 'forward',
    });
  });

  it('separates a server rejection from an abandonment', async () => {
    const { trackFormError } = await import('@/utils/funnel');
    trackFormError('contact', '429');

    expect(trackMock).toHaveBeenCalledWith('form_error', {
      form_name: 'contact',
      reason: '429',
    });
  });

  it('sends nothing at all once analytics consent is refused', async () => {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: false }));

    const { trackLead, trackImageView, trackCtaClick } = await import('@/utils/funnel');
    trackLead('contact');
    trackImageView('journalism', 'obama-rally');
    trackCtaClick('gallery', '/request-a-quote');

    expect(trackMock).not.toHaveBeenCalled();
    expect(gaEventMock).not.toHaveBeenCalled();
  });

  it('resumes sending when consent is granted', async () => {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: true }));

    const { trackImageView } = await import('@/utils/funnel');
    trackImageView('concerts', 'big-slime-2025');

    expect(trackMock).toHaveBeenCalledWith('image_view', {
      gallery: 'concerts',
      image_id: 'big-slime-2025',
    });
  });
});
