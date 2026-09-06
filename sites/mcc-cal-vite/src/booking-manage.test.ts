import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createManageToken, hashManageToken } from '../api/_lib/booking-token.js';

const apiMocks = vi.hoisted(() => ({
  applyRateLimit: vi.fn(async () => ({ allowed: true })),
  isSupabaseConfigured: vi.fn(() => true),
  getServiceClient: vi.fn(),
}));

vi.mock('../api/_lib/rate-limit-redis.js', () => ({
  applyRateLimit: apiMocks.applyRateLimit,
}));

vi.mock('../api/_lib/supabase-server.js', () => ({
  isSupabaseConfigured: apiMocks.isSupabaseConfigured,
  getServiceClient: apiMocks.getServiceClient,
}));

interface BookingRow {
  id: string;
  client_name: string;
  client_email: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  status: string;
  manage_token_hash: string | null;
  manage_token_expires_at: string | null;
  // Written by the handler, so absent on a freshly built row.
  cancelled_at?: string;
  rescheduled_at?: string;
}

/**
 * Minimal stand-in for the PostgREST builder, backed by an in-memory array so
 * updates are observable. Only the shapes schedule/manage.js actually calls are
 * implemented — anything else should fail loudly rather than silently pass.
 */
function supabaseStub(rows: BookingRow[]) {
  return {
    rows,
    from(table: string) {
      if (table !== 'bookings') throw new Error(`Unexpected table: ${table}`);

      return {
        select() {
          const filters: Array<(row: BookingRow) => boolean> = [];
          const builder = {
            eq(column: keyof BookingRow, value: unknown) {
              filters.push((row) => row[column] === value);
              return builder;
            },
            neq(column: keyof BookingRow, value: unknown) {
              filters.push((row) => row[column] !== value);
              return builder;
            },
            async maybeSingle() {
              const match = rows.filter((row) => filters.every((filter) => filter(row)));
              return { data: match[0] ?? null, error: null };
            },
            then(resolve: (value: { data: BookingRow[]; error: null }) => unknown) {
              const match = rows.filter((row) => filters.every((filter) => filter(row)));
              return Promise.resolve({ data: match, error: null }).then(resolve);
            },
          };
          return builder;
        },
        update(patch: Partial<BookingRow>) {
          return {
            async eq(column: keyof BookingRow, value: unknown) {
              for (const row of rows) {
                if (row[column] === value) Object.assign(row, patch);
              }
              return { error: null };
            },
          };
        },
      };
    },
  };
}

function createMockRes() {
  return {
    statusCode: 200,
    body: null as unknown,
    headers: new Map<string, string>(),
    setHeader(key: string, value: string) {
      this.headers.set(key, value);
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
      return this;
    },
  };
}

function bookingRow(overrides: Partial<BookingRow> = {}): BookingRow {
  return {
    id: 'booking-1',
    client_name: 'Jane Doe',
    client_email: 'jane@example.com',
    service_type: 'Book a Podcast Recording',
    booking_date: '2026-10-15',
    booking_time: '09:00:00',
    duration_minutes: 60,
    status: 'confirmed',
    manage_token_hash: null,
    manage_token_expires_at: null,
    ...overrides,
  };
}

async function callManage(
  req: Record<string, unknown>,
  rows: BookingRow[]
): Promise<ReturnType<typeof createMockRes>> {
  apiMocks.getServiceClient.mockReturnValue(supabaseStub(rows) as never);
  const { default: handler } = await import('../api/schedule/manage.js');
  const res = createMockRes();
  await handler({ headers: { origin: 'https://mcc-cal.com' }, ...req } as never, res as never);
  return res;
}

describe('self-service booking management', () => {
  beforeEach(() => {
    apiMocks.applyRateLimit.mockClear();
    apiMocks.isSupabaseConfigured.mockReturnValue(true);
  });

  it('rejects an unknown token without revealing that it is unknown', async () => {
    const res = await callManage({ method: 'GET', query: { token: 'not-a-real-token' } }, [
      bookingRow({ manage_token_hash: hashManageToken('some-other-token') }),
    ]);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'This booking link is no longer valid.' });
  });

  it('treats an expired token exactly like an unknown one', async () => {
    const { token, hash } = createManageToken();
    const res = await callManage({ method: 'GET', query: { token } }, [
      bookingRow({
        manage_token_hash: hash,
        manage_token_expires_at: '2020-01-01T00:00:00.000Z',
      }),
    ]);

    // Same status and same message, so a stale link cannot be distinguished
    // from a wrong one by probing.
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'This booking link is no longer valid.' });
  });

  it('returns the booking for a valid token and never echoes the token back', async () => {
    const { token, hash } = createManageToken();
    const res = await callManage({ method: 'GET', query: { token } }, [
      bookingRow({ manage_token_hash: hash }),
    ]);

    expect(res.statusCode).toBe(200);
    const { booking } = res.body as { booking: Record<string, unknown> };
    expect(booking.date).toBe('2026-10-15');
    expect(booking.time).toBe('09:00');
    expect(booking.eventTypeId).toBe('book-podcast');
    expect(JSON.stringify(res.body)).not.toContain(token);
    // The requester's email is not needed by the page, so it is not sent.
    expect(JSON.stringify(res.body)).not.toContain('jane@example.com');
  });

  it('cancels, and cancelling twice is not an error', async () => {
    const { token, hash } = createManageToken();
    const rows = [bookingRow({ manage_token_hash: hash })];

    const first = await callManage({ method: 'POST', body: { token, action: 'cancel' } }, rows);
    expect(first.statusCode).toBe(200);
    expect(rows[0].status).toBe('cancelled');
    expect(rows[0].cancelled_at).toBeTruthy();

    const second = await callManage({ method: 'POST', body: { token, action: 'cancel' } }, rows);
    expect(second.statusCode).toBe(200);
  });

  it('refuses to reschedule into a slot another booking already holds', async () => {
    const { token, hash } = createManageToken();
    const rows = [
      bookingRow({ manage_token_hash: hash }),
      bookingRow({
        id: 'booking-2',
        booking_date: '2026-10-20',
        booking_time: '14:00:00',
        duration_minutes: 60,
      }),
    ];

    const res = await callManage(
      { method: 'POST', body: { token, action: 'reschedule', date: '2026-10-20', time: '14:30' } },
      rows
    );

    expect(res.statusCode).toBe(409);
    // The original booking must be untouched by a rejected move.
    expect(rows[0].booking_date).toBe('2026-10-15');
  });

  it('refuses to reschedule into the past', async () => {
    const { token, hash } = createManageToken();
    const rows = [bookingRow({ manage_token_hash: hash })];

    const res = await callManage(
      { method: 'POST', body: { token, action: 'reschedule', date: '2020-01-01', time: '09:00' } },
      rows
    );

    expect(res.statusCode).toBe(400);
    expect(rows[0].booking_date).toBe('2026-10-15');
  });

  it('moves the booking when the new slot is free', async () => {
    const { token, hash } = createManageToken();
    const rows = [bookingRow({ manage_token_hash: hash })];

    const res = await callManage(
      { method: 'POST', body: { token, action: 'reschedule', date: '2026-10-22', time: '11:00' } },
      rows
    );

    expect(res.statusCode).toBe(200);
    expect(rows[0].booking_date).toBe('2026-10-22');
    expect(rows[0].booking_time).toBe('11:00');
    expect(rows[0].rescheduled_at).toBeTruthy();
  });

  it('will not move a cancelled booking', async () => {
    const { token, hash } = createManageToken();
    const rows = [bookingRow({ manage_token_hash: hash, status: 'cancelled' })];

    const res = await callManage(
      { method: 'POST', body: { token, action: 'reschedule', date: '2026-10-22', time: '11:00' } },
      rows
    );

    expect(res.statusCode).toBe(409);
  });

  it('applies rate limiting before touching the database', async () => {
    apiMocks.applyRateLimit.mockResolvedValueOnce({ allowed: false } as never);
    const res = await callManage({ method: 'GET', query: { token: 'anything' } }, []);

    expect(res.statusCode).toBe(429);
  });
});
