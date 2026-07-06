import { afterEach, describe, expect, it, vi } from 'vitest';

const originalEnv = { ...process.env };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  process.env = { ...originalEnv };
});

describe('admin bookings Supabase data source', () => {
  it('reads, maps, filters, summarizes, and paginates Supabase booking rows', async () => {
    process.env.VITE_SUPABASE_URL = 'https://supabase.example';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => [
          {
            id: '7f13d08a-0000-4000-9000-111111111111',
            client_name: 'Caleb Tester',
            client_email: 'caleb@example.com',
            service_type: 'Grab a Coffee',
            booking_date: '2026-04-20',
            booking_time: '09:00:00',
            duration_minutes: 30,
            notes: 'editorial workflow chat',
            status: 'confirmed',
            created_at: '2026-04-01T12:00:00.000Z',
          },
          {
            id: '7f13d08a-0000-4000-9000-222222222222',
            client_name: 'Past Client',
            client_email: 'past@example.com',
            service_type: 'Book a Podcast Recording',
            booking_date: '2026-04-21',
            booking_time: '11:00:00',
            duration_minutes: 90,
            status: 'cancelled',
            created_at: '2026-04-02T12:00:00.000Z',
          },
        ],
      })),
    );
    const {
      filterBookings,
      getBookingDerived,
      getBookingsFromSupabase,
      paginate,
      summarizeBookings,
    } = await import('../../mcc-cal-admin/api/_lib/bookings-data.js');

    const bookings = await getBookingsFromSupabase();
    const filtered = filterBookings(bookings, { status: 'confirmed', eventType: 'grab-coffee' });
    const page = paginate(filtered, '1', '10');
    const summary = summarizeBookings(bookings);
    const derived = getBookingDerived(filtered[0]);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        headers: expect.objectContaining({
          apikey: 'service-role-key',
          Authorization: 'Bearer service-role-key',
        }),
      }),
    );
    expect(bookings[0]).toEqual(
      expect.objectContaining({
        id: '7f13d08a-0000-4000-9000-111111111111',
        eventTypeId: 'grab-coffee',
        date: '2026-04-20',
        time: '09:00',
      }),
    );
    expect(page.items).toHaveLength(1);
    expect(summary).toEqual(expect.objectContaining({ total: 2, confirmed: 1, cancelled: 1 }));
    expect(derived).toEqual(expect.objectContaining({ dayOfWeek: 'Monday' }));
  });
});
