import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({
  applyRateLimit: vi.fn(async () => ({ allowed: true })),
  isSupabaseConfigured: vi.fn(() => false),
  getServiceClient: vi.fn(),
  resendSend: vi.fn(async () => ({ id: 'email_123' })),
}));

vi.mock('../api/_lib/rate-limit-redis.js', () => ({
  applyRateLimit: apiMocks.applyRateLimit,
}));

vi.mock('../api/_lib/supabase-server.js', () => ({
  isSupabaseConfigured: apiMocks.isSupabaseConfigured,
  getServiceClient: apiMocks.getServiceClient,
}));

vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: apiMocks.resendSend,
    },
  })),
}));

function createMockRes() {
  const headers = new Map<string, string>();
  return {
    statusCode: 200,
    body: null as unknown,
    ended: false,
    setHeader(key: string, value: string) {
      headers.set(key.toLowerCase(), value);
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
    getHeader(key: string) {
      return headers.get(key.toLowerCase());
    },
  };
}

function insertSingleClient(tableResult: { data: unknown; error: unknown }) {
  return {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(async () => tableResult),
        })),
      })),
    })),
  };
}

function bookingSelectClient(bookings: unknown[]) {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            neq: vi.fn(async () => ({ data: bookings, error: null })),
          })),
        })),
        eq: vi.fn(() => ({
          neq: vi.fn(async () => ({ data: bookings, error: null })),
        })),
      })),
    })),
  };
}

function testimonialsClient(result: { data: unknown[] | null; error: { message: string } | null }) {
  const query = {
    eq: vi.fn(() => query),
    order: vi.fn(() => query),
    limit: vi.fn(() => query),
    then: (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve),
  };

  return {
    from: vi.fn(() => ({
      select: vi.fn(() => query),
    })),
  };
}

function validBookingBody() {
  return {
    eventTypeId: 'grab-coffee',
    date: '2026-04-20',
    time: '09:00',
    durationMinutes: 30,
    requester: {
      name: 'Test User',
      email: 'test@example.com',
      notes: 'hello',
      timezone: 'America/New_York',
    },
  };
}

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  process.env = { ...originalEnv };
  process.env.NODE_ENV = 'production';
  process.env.VERCEL = '1';
  process.env.API_ALLOWED_ORIGINS = 'https://mcc-cal.com';
  process.env.RESEND_API_KEY = 're_test_key';
  apiMocks.applyRateLimit.mockResolvedValue({ allowed: true });
  apiMocks.isSupabaseConfigured.mockReturnValue(false);
  apiMocks.getServiceClient.mockReturnValue(null);
});

afterEach(() => {
  vi.unstubAllEnvs();
  process.env = { ...originalEnv };
});

describe('public API behavior', () => {
  it('persists and emails valid contact requests through the Redis-aware limiter path', async () => {
    apiMocks.isSupabaseConfigured.mockReturnValue(true);
    apiMocks.getServiceClient.mockReturnValue(insertSingleClient({ data: { id: 'contact_123' }, error: null }));
    const { default: contactHandler } = await import('../api/contact.js');
    const req = {
      method: 'POST',
      headers: { origin: 'https://mcc-cal.com', 'x-forwarded-for': '203.0.113.10' },
      body: {
        name: 'Caleb Tester',
        email: 'caleb@example.com',
        subject: 'Editorial assignment',
        message: 'Can you cover an assignment?',
        consent: true,
        contact_loaded_at: Date.now() - 5_000,
      },
    };
    const res = createMockRes();

    await contactHandler(req as never, res as never);

    expect(apiMocks.applyRateLimit).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ route: 'contact' }),
    );
    expect(apiMocks.resendSend).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ ok: true, id: 'contact_123' }));
  });

  it('silently drops quote honeypot posts before validation or email', async () => {
    const { default: quoteHandler } = await import('../api/quote.js');
    const req = {
      method: 'POST',
      headers: { origin: 'https://mcc-cal.com' },
      body: { mcc_valid_field: 'filled-by-bot' },
    };
    const res = createMockRes();

    await quoteHandler(req as never, res as never);

    expect(apiMocks.applyRateLimit).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ route: 'quote' }),
    );
    expect(apiMocks.resendSend).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('rejects invalid availability event types', async () => {
    const { default: availabilityHandler } = await import('../api/schedule/availability.js');
    const req = {
      method: 'GET',
      headers: { origin: 'https://mcc-cal.com' },
      query: { eventType: 'not-real', start: '2026-04-20', end: '2026-04-20' },
    };
    const res = createMockRes();

    await availabilityHandler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Unknown event type: not-real' });
  });

  it('removes Supabase bookings from fallback availability slots', async () => {
    apiMocks.isSupabaseConfigured.mockReturnValue(true);
    apiMocks.getServiceClient.mockReturnValue(
      bookingSelectClient([
        {
          booking_date: '2026-04-20',
          booking_time: '09:00',
          duration_minutes: 30,
        },
      ]),
    );
    const { default: availabilityHandler } = await import('../api/schedule/availability.js');
    const req = {
      method: 'GET',
      headers: { origin: 'https://mcc-cal.com' },
      query: { eventType: 'grab-coffee', start: '2026-04-20', end: '2026-04-20' },
    };
    const res = createMockRes();

    await availabilityHandler(req as never, res as never);

    const slots = (res.body as { days: Array<{ slots: Array<{ time: string }> }> }).days[0].slots;
    expect(res.statusCode).toBe(200);
    expect(slots.some((slot) => slot.time === '2026-04-20T09:00:00.000Z')).toBe(false);
  });

  it('blocks production booking requests that overlap existing Supabase bookings', async () => {
    apiMocks.isSupabaseConfigured.mockReturnValue(true);
    apiMocks.getServiceClient.mockReturnValue(
      bookingSelectClient([
        {
          booking_time: '09:00',
          duration_minutes: 30,
        },
      ]),
    );
    const { default: bookingHandler } = await import('../api/schedule/book.js');
    const req = {
      method: 'POST',
      headers: { origin: 'https://mcc-cal.com' },
      body: validBookingBody(),
    };
    const res = createMockRes();

    await bookingHandler(req as never, res as never);

    expect(apiMocks.applyRateLimit).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ route: 'booking' }),
    );
    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      error: 'This time slot is no longer available. Please select another time.',
    });
  });

  it('returns a configuration error for Google reviews when credentials are absent', async () => {
    delete process.env.GOOGLE_PLACES_API_KEY;
    delete process.env.GOOGLE_PLACE_ID;
    const { default: reviewsHandler } = await import('../api/google-reviews.js');
    const req = {
      method: 'GET',
      headers: { origin: 'https://mcc-cal.com' },
      query: {},
    };
    const res = createMockRes();

    await reviewsHandler(req as never, res as never);

    expect(apiMocks.applyRateLimit).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ route: 'google-reviews' }),
    );
    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({ error: 'Review service not configured.' });
  });

  it('returns a Supabase fallback response for testimonials database errors', async () => {
    apiMocks.isSupabaseConfigured.mockReturnValue(true);
    apiMocks.getServiceClient.mockReturnValue(
      testimonialsClient({ data: null, error: { message: 'database unavailable' } }),
    );
    const { default: testimonialsHandler } = await import('../api/testimonials.js');
    const req = {
      method: 'GET',
      headers: { origin: 'https://mcc-cal.com' },
      query: { limit: '3' },
    };
    const res = createMockRes();

    await testimonialsHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ testimonials: [], source: 'supabase-error' });
  });
});
