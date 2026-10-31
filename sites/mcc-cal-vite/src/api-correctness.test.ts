import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Four small defects found in an audit, each pinned here because each is the
 * kind that produces no error and no log line.
 */
const apiMocks = vi.hoisted(() => ({
  applyRateLimit: vi.fn(async () => ({ allowed: true })),
  isSupabaseConfigured: vi.fn(() => false),
  getServiceClient: vi.fn(() => null),
  captureApiException: vi.fn(async () => {}),
}));

vi.mock('../api/_lib/rate-limit-redis.js', () => ({ applyRateLimit: apiMocks.applyRateLimit }));
vi.mock('../api/_lib/supabase-server.js', () => ({
  isSupabaseConfigured: apiMocks.isSupabaseConfigured,
  getServiceClient: apiMocks.getServiceClient,
}));
vi.mock('../api/_lib/sentry.js', () => ({ captureApiException: apiMocks.captureApiException }));

function createMockRes() {
  return {
    statusCode: 200,
    body: null as never,
    setHeader() {},
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload as never;
      return this;
    },
    end() {
      return this;
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
  apiMocks.applyRateLimit.mockResolvedValue({ allowed: true });
});

function availabilityRequest(start: string, end: string) {
  return {
    method: 'GET',
    headers: { origin: 'https://mcc-cal.com' },
    query: { eventType: 'grab-coffee', start, end },
  };
}

describe('api/schedule/availability bounds the range it will walk', () => {
  /**
   * The handler validated the shape of start and end but never the span between
   * them, then walked one day at a time generating slots and asked Google for
   * the whole window in a single events.list. A millennium-wide request was
   * accepted, at 60 requests a minute.
   */
  it('refuses a range wider than the cap', async () => {
    const { default: handler } = await import('../api/schedule/availability.js');
    const res = createMockRes();
    await handler(availabilityRequest('2020-01-01', '2999-12-31'), res);

    expect(res.statusCode).toBe(400);
    expect(String((res.body as { error: string }).error)).toMatch(/range too large/i);
  });

  it('refuses an end date before the start date', async () => {
    const { default: handler } = await import('../api/schedule/availability.js');
    const res = createMockRes();
    await handler(availabilityRequest('2026-10-08', '2026-10-01'), res);

    expect(res.statusCode).toBe(400);
    expect(String((res.body as { error: string }).error)).toMatch(/before the start/i);
  });

  it('still accepts the month the booking widget actually asks for', async () => {
    // The guard is worthless if it also refuses real traffic. Without Google
    // credentials this cannot reach 200, but it must get past the range check,
    // so anything other than a 400 about the range proves that.
    const { default: handler } = await import('../api/schedule/availability.js');
    const res = createMockRes();
    await handler(availabilityRequest('2026-10-01', '2026-10-31'), res);

    const error = (res.body as { error?: string } | null)?.error ?? '';
    expect(error).not.toMatch(/range too large|before the start/i);
  });
});

describe('api/manifests/[type] rejects inherited keys', () => {
  /**
   * TYPE_MAP is a plain object literal, so TYPE_MAP['constructor'] is inherited
   * and truthy. It passed the `if (!mapping)` guard, and path.resolve then threw
   * a TypeError outside the try below, crashing the function rather than
   * answering 400.
   */
  /**
   * Only all-lowercase inherited names reach the bug, because the handler
   * lowercases first: 'toString' becomes 'tostring', which is not a property of
   * Object.prototype, so it was always rejected correctly. Asserting those two
   * looked like broader coverage and was actually two cases that passed against
   * the unfixed handler, so they are gone. 'constructor' and '__proto__' are
   * the exploitable set.
   */
  it.each(['constructor', '__proto__'])('answers 400 for %s rather than throwing', async (type) => {
    const { default: handler } = await import('../api/manifests/[type].js');
    const res = createMockRes();

    // This handler is synchronous, so it is called directly rather than
    // awaited. Before the fix path.resolve threw here, outside the try lower
    // down, so the function crashed instead of answering.
    expect(() =>
      handler({ method: 'GET', headers: { origin: 'https://mcc-cal.com' }, query: { type } }, res),
    ).not.toThrow();

    expect(res.statusCode).toBe(400);
  });

  it('rejects a mixed-case inherited name too, whatever the reason', async () => {
    // 'toString' is safe today only because lowercasing mangles it. Pinning it
    // here means a future change to that lowercasing cannot quietly reopen the
    // hole, without pretending this case ever failed before.
    const { default: handler } = await import('../api/manifests/[type].js');
    const res = createMockRes();
    handler(
      { method: 'GET', headers: { origin: 'https://mcc-cal.com' }, query: { type: 'toString' } },
      res,
    );
    expect(res.statusCode).toBe(400);
  });

  it('still serves a real type', async () => {
    const { default: handler } = await import('../api/manifests/[type].js');
    const res = createMockRes();
    handler(
      { method: 'GET', headers: { origin: 'https://mcc-cal.com' }, query: { type: 'events' } },
      res,
    );

    // 200 when the file is on disk, 404 when it is not. Either proves the type
    // was recognised, which is what this asserts; 400 would mean it was not.
    expect(res.statusCode).not.toBe(400);
  });
});
