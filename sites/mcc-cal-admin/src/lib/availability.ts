/**
 * Booking availability types and helpers for the admin editor.
 *
 * Times are minutes from midnight in the owner's timezone, matching
 * supabase/migrations/20260906120000 and the public site's timezone module.
 */

export type BookingTypeId = 'grab-coffee' | 'book-podcast';

export interface AvailabilityRule {
  id?: string;
  bookingType: BookingTypeId;
  /** 0 = Sunday, 6 = Saturday, matching Date.getDay(). */
  weekday: number;
  startMinute: number;
  endMinute: number;
  /**
   * Lead time required before a slot in this window can be booked. 24 for free
   * time; 336 (14 days) for hours that need a day-job shift swapped.
   */
  minNoticeHours: number;
  label: string | null;
  isActive: boolean;
}

/** Presets offered in the editor, so notice periods stay meaningful values. */
export const NOTICE_PRESETS = [
  { hours: 24, label: 'Free — 1 day notice' },
  { hours: 72, label: 'Free — 3 days notice' },
  { hours: 336, label: 'Work shift — 14 days notice' },
] as const;

export function describeNotice(hours: number): string {
  const preset = NOTICE_PRESETS.find((option) => option.hours === hours);
  if (preset) return preset.label;
  if (hours % 24 === 0) return `${hours / 24} days notice`;
  return `${hours}h notice`;
}

export interface AvailabilityBlackout {
  id: string;
  startsOn: string;
  endsOn: string;
  bookingType: BookingTypeId | null;
  reason: string | null;
}

export interface AvailabilityData {
  rules: AvailabilityRule[];
  blackouts: AvailabilityBlackout[];
}

export const WEEKDAYS = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
] as const;

export const BOOKING_TYPE_LABELS: Record<BookingTypeId, string> = {
  'grab-coffee': 'Grab a Coffee',
  'book-podcast': 'Book a Podcast',
};

/** 570 -> "09:30", the value an <input type="time"> expects. */
export function minutesToTimeInput(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** "09:30" -> 570. Returns null for unparseable input. */
export function timeInputToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;

  return hour * 60 + minute;
}

/** Human summary of a window, e.g. "9:00 AM – 5:00 PM". */
export function describeWindow(startMinute: number, endMinute: number): string {
  const format = (minutes: number) => {
    const hour24 = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const suffix = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
  };
  return `${format(startMinute)} – ${format(endMinute)}`;
}
