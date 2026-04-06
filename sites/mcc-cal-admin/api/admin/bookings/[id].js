import { kv } from '@vercel/kv';
import { requireAdminSession } from '../../_lib/auth.js';

const KV_BOOKINGS_KEY = 'schedule:bookings';

async function getBookingsFromKV() {
  try {
    const bookings = await kv.get(KV_BOOKINGS_KEY);
    return Array.isArray(bookings) ? bookings : [];
  } catch (err) {
    console.error('[admin/bookings/detail] KV read error:', err);
    return [];
  }
}

function findBooking(bookings, id) {
  return bookings.find(b => b.id === id);
}

function getRelatedBookings(bookings, targetBooking) {
  // Find bookings from same requester
  const sameRequester = bookings.filter(b => 
    b.id !== targetBooking.id &&
    b.requester?.email?.toLowerCase() === targetBooking.requester?.email?.toLowerCase()
  ).slice(0, 5);

  // Find bookings on same date
  const sameDate = bookings.filter(b =>
    b.id !== targetBooking.id &&
    b.date === targetBooking.date &&
    b.status === 'confirmed'
  );

  return { sameRequester, sameDate };
}

export default async function handler(req, res) {
  const session = requireAdminSession(req, res);
  if (!session) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    // Support both /api/admin/bookings/[id] and /api/admin/bookings?id=xxx patterns
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Try to get ID from path (Vercel file-based routing) or query param
    let id = url.searchParams.get('id');
    
    // If no query param, extract from path - remove /api/admin/bookings/ prefix
    if (!id) {
      const pathParts = url.pathname.split('/');
      // Remove empty strings from leading/trailing slashes
      const cleanParts = pathParts.filter(p => p);
      // ID should be the last segment
      id = cleanParts[cleanParts.length - 1];
    }

    if (!id || !id.startsWith('book_')) {
      return res.status(400).json({
        ok: false,
        error: 'invalid_booking_id',
        message: 'Booking ID must start with "book_"',
      });
    }

    const allBookings = await getBookingsFromKV();
    const booking = findBooking(allBookings, id);

    if (!booking) {
      return res.status(404).json({
        ok: false,
        error: 'booking_not_found',
        message: `No booking found with ID: ${id}`,
      });
    }

    const related = getRelatedBookings(allBookings, booking);

    // Calculate derived fields
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const isPast = bookingDate < now;
    const isToday = booking.date === now.toISOString().split('T')[0];

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json({
      ok: true,
      data: {
        ...booking,
        derived: {
          isPast,
          isToday,
          dayOfWeek: bookingDate.toLocaleDateString('en-US', { weekday: 'long' }),
          formattedDate: bookingDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
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
    res.status(500).json({
      ok: false,
      error: 'failed_to_load_booking',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
