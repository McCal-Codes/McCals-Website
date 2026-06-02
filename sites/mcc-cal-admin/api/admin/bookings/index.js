import { requireAdminSession } from '../../_lib/auth.js';
import {
  filterBookings,
  getBookingsFromSupabase,
  paginate,
  summarizeBookings,
} from '../../_lib/bookings-data.js';

export default async function handler(req, res) {
  const session = requireAdminSession(req, res);
  if (!session) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const query = Object.fromEntries(url.searchParams);
    const allBookings = await getBookingsFromSupabase();
    const filtered = filterBookings(allBookings, query);
    const { items, pagination } = paginate(filtered, query.page, query.limit);

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json({
      ok: true,
      data: items,
      pagination,
      summary: summarizeBookings(allBookings),
      filters: {
        applied: {
          startDate: query.start || null,
          endDate: query.end || null,
          status: query.status || null,
          eventType: query.eventType || null,
          email: query.email || null,
        },
      },
      meta: {
        operator: session.email || session.preferredUsername,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[admin/bookings] Error:', err);
    res.status(err.statusCode || 500).json({
      ok: false,
      error: err.code || 'failed_to_load_bookings',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
