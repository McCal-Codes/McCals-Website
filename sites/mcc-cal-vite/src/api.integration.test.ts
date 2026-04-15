import { afterEach, describe, expect, it } from 'vitest';
import manifestHandler from '../api/manifests/[type].js';

function createMockRes() {
  const headers = new Map<string, string>();
  const response = {
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
  return response;
}

const originalEnv = {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  API_ALLOWED_ORIGINS: process.env.API_ALLOWED_ORIGINS,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
};

afterEach(() => {
  process.env.NODE_ENV = originalEnv.NODE_ENV;
  process.env.VERCEL = originalEnv.VERCEL;
  process.env.API_ALLOWED_ORIGINS = originalEnv.API_ALLOWED_ORIGINS;
  process.env.RESEND_API_KEY = originalEnv.RESEND_API_KEY;
});

describe('api/manifests/[type]', () => {
  it('returns manifest JSON for valid type', () => {
    const req = {
      method: 'GET',
      query: { type: 'journalism' },
      headers: { origin: 'https://mcc-cal.com' },
    };
    const res = createMockRes();

    manifestHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.getHeader('content-type')).toBe('application/json');
    expect(res.getHeader('access-control-allow-origin')).toBe('https://mcc-cal.com');
  });

  it('rejects disallowed CORS preflight origin', () => {
    process.env.API_ALLOWED_ORIGINS = 'https://mcc-cal.com';
    const req = {
      method: 'OPTIONS',
      headers: { origin: 'https://evil.example' },
      query: {},
    };
    const res = createMockRes();

    manifestHandler(req as never, res as never);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: 'Origin not allowed' });
  });
});

describe('api/schedule/book', () => {
  it('handles allowed CORS preflight', async () => {
    process.env.API_ALLOWED_ORIGINS = 'https://mcc-cal.com';
    process.env.RESEND_API_KEY = 're_test_key';
    const req = {
      method: 'OPTIONS',
      headers: { origin: 'https://mcc-cal.com' },
      body: {},
    };
    const res = createMockRes();
    const { default: bookingHandler } = await import('../api/schedule/book.js');

    await bookingHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.ended).toBe(true);
    expect(res.getHeader('access-control-allow-origin')).toBe('https://mcc-cal.com');
  });

  it('returns dev mock booking for valid request payload', async () => {
    process.env.NODE_ENV = 'development';
    process.env.VERCEL = '';
    process.env.API_ALLOWED_ORIGINS = 'https://mcc-cal.com';
    process.env.RESEND_API_KEY = 're_test_key';

    const req = {
      method: 'POST',
      headers: { origin: 'https://mcc-cal.com' },
      body: {
        eventTypeId: 'grab-coffee',
        date: '2026-04-20',
        time: '13:00',
        durationMinutes: 30,
        requester: {
          name: 'Test User',
          email: 'test@example.com',
          notes: 'hello',
        },
      },
    };
    const res = createMockRes();
    const { default: bookingHandler } = await import('../api/schedule/book.js');

    await bookingHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect((res.body as { booking?: { id?: string } }).booking?.id).toContain('dev-mock-');
  });
});
