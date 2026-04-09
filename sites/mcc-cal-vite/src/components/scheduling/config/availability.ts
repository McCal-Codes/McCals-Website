import type { AvailabilityRules } from '../types/booking.js';

/**
 * Availability configuration
 * Define when you're available for bookings
 * 
 * NOTE: Adjust these settings to match your actual availability
 */

export const AVAILABILITY_RULES: AvailabilityRules = {
  // Your timezone - all times stored in this timezone
  timezone: 'America/New_York', // Change to your timezone

  // Weekly working hours
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  weeklyHours: [
    { day: 1, start: '09:00', end: '17:00' }, // Monday
    { day: 2, start: '09:00', end: '17:00' }, // Tuesday
    { day: 3, start: '09:00', end: '17:00' }, // Wednesday
    { day: 4, start: '09:00', end: '17:00' }, // Thursday
    { day: 5, start: '09:00', end: '17:00' }, // Friday
    // No weekend availability by default
  ],

  // Specific dates to block (YYYY-MM-DD format)
  // Useful for vacations, holidays, busy days
  blockedDates: [
    // Example: '2026-12-25', // Christmas
  ],

  // How far ahead can people book (days)
  maxDaysAhead: 30,

  // Minimum notice required (hours)
  minHoursNotice: 24,

  // Default slot duration for availability checks
  slotDurationMinutes: 30,

  // Buffer time before meetings
  bufferMinutesBefore: 5,

  // Buffer time after meetings
  bufferMinutesAfter: 5,
};

export function getAvailabilityRules(): AvailabilityRules {
  return { ...AVAILABILITY_RULES };
}
