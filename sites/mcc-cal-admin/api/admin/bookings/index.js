import { kv } from '@vercel/kv';
import { requireAdminSession } from '../_lib/auth.js';

const KV_BOOKINGS_KEY = 'schedule:bookings';

async function getBookingsFromKV() {
  try {
    const bookings = await kv.get(KV_BOOKINGS_KEY);
    return Array.isArray(bookings) ? bookings : [];
  } catch (err) {
    console.error('[admin/bookings] KV read error:', err);
    return [];
  }
}

function parseDateRange(query) {
  const { start, end } = query;
  const startDate = start && /^\d{4}-\d{2}-\d{2}$/.test(start) ? start : null;
  const endDate = end && /^\d{4}-\d{2}-\d{2}$/.test(end) ? end : null;
  return { startDate, endDate };
}

function filterBookings(bookings, query) {
  let filtered = [...bookings];

  const { startDate, endDate } = parseDateRange(query);
  const status = query.status;
  const eventType = query.eventType;
  const email = query.email?.toLowerCase().trim();

  // Filter by date range
  if (startDate) {
    filtered = filtered.filter(b => b.date >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(b => b.date <= endDate);
  }

  // Filter by status
  if (status && ['confirmed', 'cancelled', 'completed'].includes(status)) {
    filtered = filtered.filter(b => b.status === status);
  }

  // Filter by event type
  if (eventType) {
    filtered = filtered.filter(b => b.eventTypeId === eventType);
  }

  // Filter by email (partial match)
  if (email) {
    filtered = filtered.filter(b => 
      b.requester?.email?.toLowerCase().includes(email)
    );
  }

  // Sort by date descending, then time
  filtered.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.time.localeCompare(a.time);
  });

  return filtered;
}

function paginate(items, page, limit) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit;
  
  return {
    items: items.slice(start, end),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: items.length,
      totalPages: Math.ceil(items.length / safeLimit),
      hasNext: end < items.length,
      hasPrev: start > 0,
    },
  };
}

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

    const allBookings = await getBookingsFromKV();
    const filtered = filterBookings(allBookings, query);
    const { items, pagination } = paginate(
      filtered, 
      query.page, 
      query.limit
    );

    // Summary statistics
    const summary = {
      total: allBookings.length,
      confirmed: allBookings.filter(b => b.status === 'confirmed').length,
      cancelled: allBookings.filter(b => b.status === 'cancelled').length,
      completed: allBookings.filter(b => b.status === 'completed').length,
      upcoming: allBookings.filter(b => {
        if (b.status !== 'confirmed') return false;
        const bookingDate = new Date(b.date);
        return bookingDate >= new Date();
      }).length,
    };

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json({
      ok: true,
      data: items,
      pagination,
      summary,
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
    res.status(500).json({
      ok: false,
      error: 'failed_to_load_bookings',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
