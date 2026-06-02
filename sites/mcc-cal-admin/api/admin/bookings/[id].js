import { requireAdminSession } from '../../_lib/auth.js';
import {
  getBookingDerived,
  getBookingsFromSupabase,
  getRelatedBookings,
} from '../../_lib/bookings-data.js';

function getBookingId(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const queryId = url.searchParams.get('id');
  if (queryId) return queryId;

  const pathParts = url.pathname.split('/').filter(Boolean);
  return pathParts[pathParts.length - 1] || '';
}

function isValidBookingId(id) {
  return Boolean(id && !id.includes('/') && !id.includes('\\') && !id.includes('\0'));
}

export default async function handler(req, res) {
  const session = requireAdminSession(req, res);
  if (!session) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const id = getBookingId(req);

    if (!isValidBookingId(id)) {
      return res.status(400).json({
        ok: false,
        error: 'invalid_booking_id',
        message: 'Booking ID is invalid',
      });
    }

    const allBookings = await getBookingsFromSupabase();
    const booking = allBookings.find((item) => item.id === id);

    if (!booking) {
      return res.status(404).json({
        ok: false,
        error: 'booking_not_found',
        message: `No booking found with ID: ${id}`,
      });
    }

    const related = getRelatedBookings(allBookings, booking);

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json({
      ok: true,
      data: {
        ...booking,
        derived: getBookingDerived(booking),
      },
      related: {
        sameRequester: related.sameRequester,
        sameDate: related.sameDate,
      },
      meta: {
        operator: session.email || session.preferredUsername,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[admin/bookings/detail] Error:', err);
    res.status(err.statusCode || 500).json({
      ok: false,
      error: err.code || 'failed_to_load_booking',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
