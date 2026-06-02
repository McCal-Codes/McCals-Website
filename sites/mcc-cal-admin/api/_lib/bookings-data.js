const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OWNER_TIMEZONE = 'America/New_York';
const MAX_ADMIN_BOOKINGS = 1000;

const EVENT_TYPE_BY_SERVICE = {
  'grab a coffee': 'grab-coffee',
  'book a podcast recording': 'book-podcast',
  'book a podcast': 'book-podcast',
};

function supabaseConfigError() {
  const error = new Error('Supabase admin booking access is not configured');
  error.statusCode = 503;
  error.code = 'supabase_not_configured';
  return error;
}

function getSupabaseConfig() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw supabaseConfigError();
  }

  return {
    url: SUPABASE_URL.replace(/\/$/, ''),
    key: SERVICE_ROLE_KEY,
  };
}

function toDateString(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function toTimeString(value) {
  if (!value) return '00:00';
  return String(value).slice(0, 5);
}

function toEventTypeId(serviceType) {
  const normalized = String(serviceType || '').trim().toLowerCase();
  if (EVENT_TYPE_BY_SERVICE[normalized]) return EVENT_TYPE_BY_SERVICE[normalized];
  return normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'booking';
}

function toStatus(value) {
  const status = String(value || '').toLowerCase();
  if (status === 'cancelled' || status === 'completed') return status;
  return 'confirmed';
}

export function mapSupabaseBooking(row) {
  const date = toDateString(row.booking_date);
  const time = toTimeString(row.booking_time);

  return {
    id: String(row.id),
    eventTypeId: toEventTypeId(row.service_type),
    date,
    time,
    durationMinutes: Number(row.duration_minutes) || 60,
    requester: {
      name: row.client_name || 'Unknown requester',
      email: row.client_email || '',
      notes: row.notes || undefined,
    },
    status: toStatus(row.status),
    createdAt: row.created_at || `${date}T${time}:00.000Z`,
    requesterTimezone: row.requester_timezone || OWNER_TIMEZONE,
    ownerTimezone: OWNER_TIMEZONE,
  };
}

export async function getBookingsFromSupabase() {
  const config = getSupabaseConfig();
  const url = new URL(`${config.url}/rest/v1/bookings`);
  url.searchParams.set(
    'select',
    'id,client_name,client_email,service_type,booking_date,booking_time,duration_minutes,notes,status,created_at',
  );
  url.searchParams.set('order', 'booking_date.desc,booking_time.desc');
  url.searchParams.set('limit', String(MAX_ADMIN_BOOKINGS));

  const response = await fetch(url, {
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const error = new Error(`Supabase bookings read failed: ${response.status}`);
    error.statusCode = response.status;
    error.code = 'supabase_bookings_failed';
    throw error;
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows.map(mapSupabaseBooking) : [];
}

function parseDateRange(query) {
  const { start, end } = query;
  const startDate = start && /^\d{4}-\d{2}-\d{2}$/.test(start) ? start : null;
  const endDate = end && /^\d{4}-\d{2}-\d{2}$/.test(end) ? end : null;
  return { startDate, endDate };
}

export function filterBookings(bookings, query) {
  let filtered = [...bookings];

  const { startDate, endDate } = parseDateRange(query);
  const status = query.status;
  const eventType = query.eventType;
  const email = query.email?.toLowerCase().trim();

  if (startDate) {
    filtered = filtered.filter((booking) => booking.date >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter((booking) => booking.date <= endDate);
  }
  if (status && ['confirmed', 'cancelled', 'completed'].includes(status)) {
    filtered = filtered.filter((booking) => booking.status === status);
  }
  if (eventType) {
    filtered = filtered.filter((booking) => booking.eventTypeId === eventType);
  }
  if (email) {
    filtered = filtered.filter((booking) => booking.requester.email.toLowerCase().includes(email));
  }

  filtered.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.time.localeCompare(a.time);
  });

  return filtered;
}

export function paginate(items, page, limit) {
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

export function summarizeBookings(bookings) {
  const now = new Date();

  return {
    total: bookings.length,
    confirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
    cancelled: bookings.filter((booking) => booking.status === 'cancelled').length,
    completed: bookings.filter((booking) => booking.status === 'completed').length,
    upcoming: bookings.filter((booking) => {
      if (booking.status !== 'confirmed') return false;
      return new Date(`${booking.date}T${booking.time}:00`) >= now;
    }).length,
  };
}

export function getRelatedBookings(bookings, targetBooking) {
  const targetEmail = targetBooking.requester.email.toLowerCase();
  const sameRequester = bookings
    .filter((booking) => booking.id !== targetBooking.id && booking.requester.email.toLowerCase() === targetEmail)
    .slice(0, 5);
  const sameDate = bookings.filter(
    (booking) => booking.id !== targetBooking.id && booking.date === targetBooking.date && booking.status === 'confirmed',
  );

  return { sameRequester, sameDate };
}

export function getBookingDerived(booking) {
  const bookingDate = new Date(`${booking.date}T${booking.time}:00`);
  const now = new Date();

  return {
    isPast: bookingDate < now,
    isToday: booking.date === now.toISOString().split('T')[0],
    dayOfWeek: bookingDate.toLocaleDateString('en-US', { weekday: 'long' }),
    formattedDate: bookingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };
}
