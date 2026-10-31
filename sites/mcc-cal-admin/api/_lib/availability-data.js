/**
 * Supabase access for booking availability, via PostgREST.
 *
 * Uses raw fetch with the service-role key, matching bookings-data.js — the
 * admin API has no supabase-js dependency and this keeps it that way.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isAvailabilityConfigured() {
  return Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
}

function config() {
  if (!isAvailabilityConfigured()) {
    const error = new Error('Supabase availability access is not configured');
    error.statusCode = 503;
    error.code = 'supabase_not_configured';
    throw error;
  }
  return { url: SUPABASE_URL.replace(/\/$/, ''), key: SERVICE_ROLE_KEY };
}

async function request(path, init = {}) {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const error = new Error(`Supabase availability request failed: ${response.status} ${body}`);
    error.statusCode = response.status;
    error.code = 'supabase_availability_failed';
    throw error;
  }

  // DELETE and minimal-return writes have no body.
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function fetchAvailability() {
  const [rules, blackouts] = await Promise.all([
    request('availability_rules?select=id,booking_type,weekday,start_minute,end_minute,is_active&order=booking_type,weekday'),
    request('availability_blackouts?select=id,starts_on,ends_on,booking_type,reason&order=starts_on'),
  ]);

  return {
    rules: (rules ?? []).map((row) => ({
      id: row.id,
      bookingType: row.booking_type,
      weekday: row.weekday,
      startMinute: row.start_minute,
      endMinute: row.end_minute,
      isActive: row.is_active,
    })),
    blackouts: (blackouts ?? []).map((row) => ({
      id: row.id,
      startsOn: row.starts_on,
      endsOn: row.ends_on,
      bookingType: row.booking_type,
      reason: row.reason,
    })),
  };
}

/**
 * Replaces the whole weekly schedule for one booking type.
 *
 * Sending the full week rather than patching individual days keeps saving
 * atomic from the editor's point of view — there is no state where half the
 * week has been updated.
 */
export async function replaceRulesForType(bookingType, rules) {
  await request(`availability_rules?booking_type=eq.${encodeURIComponent(bookingType)}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  });

  if (!rules.length) return;

  await request('availability_rules', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(
      rules.map((rule) => ({
        booking_type: bookingType,
        weekday: rule.weekday,
        start_minute: rule.startMinute,
        end_minute: rule.endMinute,
        is_active: rule.isActive !== false,
      }))
    ),
  });
}
