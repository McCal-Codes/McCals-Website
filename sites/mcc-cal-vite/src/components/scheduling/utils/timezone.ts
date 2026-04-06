/**
 * Timezone utilities
 * Handles conversion between owner's timezone and requester's local timezone
 */

const OWNER_TIMEZONE = 'America/New_York'; // Should match AVAILABILITY_RULES.timezone

/**
 * Get the requester's timezone from the browser
 */
export function getRequesterTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/**
 * Format a time in the requester's local timezone for display
 */
export function formatTimeInTimezone(
  dateStr: string,
  timeStr: string,
  _sourceTimezone: string,
  targetTimezone: string
): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Create date object
  const date = new Date(dateStr + 'T00:00:00');
  date.setHours(hours, minutes, 0, 0);

  // Format in target timezone
  return date.toLocaleTimeString('en-US', {
    timeZone: targetTimezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date for display with timezone awareness
 */
export function formatDateWithTimezone(
  dateStr: string,
  targetTimezone: string,
  format: 'full' | 'short' | 'weekday' = 'full'
): string {
  const date = new Date(dateStr + 'T00:00:00');
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: targetTimezone,
  };

  switch (format) {
    case 'full':
      return date.toLocaleDateString('en-US', {
        ...options,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'short':
      return date.toLocaleDateString('en-US', {
        ...options,
        month: 'short',
        day: 'numeric',
      });
    case 'weekday':
      return date.toLocaleDateString('en-US', {
        ...options,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    default:
      return date.toLocaleDateString('en-US', options);
  }
}

/**
 * Get timezone display name
 */
export function getTimezoneDisplayName(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart?.value || timezone;
  } catch {
    return timezone;
  }
}

/**
 * Check if two times are on the same day in the given timezone
 */
export function isSameDayInTimezone(
  date1: Date,
  date2: Date,
  timezone: string
): boolean {
  const d1 = new Date(date1.toLocaleString('en-US', { timeZone: timezone }));
  const d2 = new Date(date2.toLocaleString('en-US', { timeZone: timezone }));
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export { OWNER_TIMEZONE };
