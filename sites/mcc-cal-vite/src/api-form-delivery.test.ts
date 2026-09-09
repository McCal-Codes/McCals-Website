import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The contact and quote endpoints answered
 *
 *   200 { ok: true, message: 'Message received. Thank you for contacting us!' }
 *
 * whenever control reached the end of the handler, including when the Supabase
 * row was never written and the email never sent. The visitor was thanked for a
 * message that reached nobody, and ContactForm then cleared the field, so the
 * text was gone too.
 *
 * Two ways in. The email catch returned early only `if (submissionId)`, so an
 * unconfigured Supabase plus a throwing send fell through. And with
 * RESEND_API_KEY unset the else branch only warned, then fell through as well.
 * That second one is the live case whenever the key is absent.
 *
 * scripts/smoke-forms.js was written for exactly this shape, and its own header
 * records that it ran undetected for months. These tests are the version that
 * runs on every commit.
 */
const apiMocks = vi.hoisted(() => ({
  applyRateLimit: vi.fn(async () => ({ allowed: true })),
  isSupabaseConfigured: vi.fn(() => false),
  getServiceClient: vi.fn(),
  resendSend: vi.fn(async () => ({ id: 'email_123' })),
  captureApiException: vi.fn(async () => {}),
}));

vi.mock('../api/_lib/rate-limit-redis.js', () => ({ applyRateLimit: apiMocks.applyRateLimit }));
vi.mock('../api/_lib/supabase-server.js', () => ({
  isSupabaseConfigured: apiMocks.isSupabaseConfigured,
  getServiceClient: apiMocks.getServiceClient,
}));
vi.mock('../api/_lib/sentry.js', () => ({ captureApiException: apiMocks.captureApiException }));
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({ emails: { send: apiMocks.resendSend } })),
}));

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

function storedClient() {
  return {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: 'row_1' }, error: null })) })),
      })),
    })),
  };
}

const CONTACT_BODY = {
  name: 'Caleb Tester',
  email: 'caleb@example.com',
  subject: 'Editorial assignment',
  message: 'Can you cover an assignment?',
  consent: true,
  contact_loaded_at: Date.now() - 5_000,
};

const QUOTE_BODY = {
  name: 'Caleb Tester',
  email: 'caleb@example.com',
  service_type: 'Event Photography',
  project_date: '2026-11-01',
  intended_use: 'Editorial',
  duration: '2 hours',
  geographic: 'Pittsburgh',
  budget: '1000',
  deliverable: ['Digital'],
  consent: true,
};

function request(body: unknown) {
  return {
    method: 'POST',
    headers: { origin: 'https://mcc-cal.com', 'x-forwarded-for': '203.0.113.10' },
    body,
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
  apiMocks.resendSend.mockResolvedValue({ id: 'email_123' });
});

afterEach(() => {
  process.env = { ...originalEnv };
});

const ENDPOINTS = [
  { name: 'contact', load: () => import('../api/contact.js'), body: CONTACT_BODY },
  { name: 'quote', load: () => import('../api/quote.js'), body: QUOTE_BODY },
] as const;

describe.each(ENDPOINTS)('api/$name delivery reporting', ({ load, body }) => {
  it('reports failure when the submission is neither stored nor emailed', async () => {
    // No Supabase, and the send throws: the exact state that used to answer
    // 200 "Message received".
    apiMocks.isSupabaseConfigured.mockReturnValue(false);
    apiMocks.resendSend.mockRejectedValue(new Error('resend is down'));

    const { default: handler } = await load();
    const res = createMockRes();
    await handler(request(body), res);

    expect(res.statusCode).toBe(503);
    expect(res.body).toMatchObject({ stored: false, emailed: false });
    expect(res.body).not.toHaveProperty('ok', true);
    // The visitor is given somewhere to go rather than a dead end.
    expect(String((res.body as { error: string }).error)).toContain('@');
  });

  it('reports failure when there is no email service and no database either', async () => {
    // The live case whenever RESEND_API_KEY is unset. Nothing throws here; the
    // handler simply never sends, and used to fall through to a thank you.
    delete process.env.RESEND_API_KEY;
    apiMocks.isSupabaseConfigured.mockReturnValue(false);

    const { default: handler } = await load();
    const res = createMockRes();
    await handler(request(body), res);

    expect(res.statusCode).toBe(503);
    expect(res.body).toMatchObject({ stored: false, emailed: false });
  });

  it('still succeeds when the row was written but the email failed', async () => {
    // A stored enquiry is a real receipt: it is on record and will be seen, so
    // this must stay a 200. Only the total failure above is a 503.
    apiMocks.isSupabaseConfigured.mockReturnValue(true);
    apiMocks.getServiceClient.mockReturnValue(storedClient());
    apiMocks.resendSend.mockRejectedValue(new Error('resend is down'));

    const { default: handler } = await load();
    const res = createMockRes();
    await handler(request(body), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true, stored: true, emailed: false, emailError: true });
  });

  it('reports full success when both happened', async () => {
    apiMocks.isSupabaseConfigured.mockReturnValue(true);
    apiMocks.getServiceClient.mockReturnValue(storedClient());

    const { default: handler } = await load();
    const res = createMockRes();
    await handler(request(body), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true, stored: true, emailed: true });
    expect(res.body).not.toHaveProperty('emailError', true);
  });

  it('succeeds when the email sent but the database was not configured', async () => {
    // Reaching the owner is enough. This is the common production shape.
    apiMocks.isSupabaseConfigured.mockReturnValue(false);

    const { default: handler } = await load();
    const res = createMockRes();
    await handler(request(body), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true, stored: false, emailed: true });
  });
});
