import type { AvailabilityRules, TimeSlot, DayAvailability, Booking } from '../types/booking.js';
import { AVAILABILITY_RULES } from '../config/availability.js';
import { formatDateForInput, parseDateString, addDays } from './dateHelpers.js';

/**
 * Availability calculation utilities
 * Determines which time slots are available for booking
 */

/**
 * Check if a date is available for booking
 */
export function isDateAvailable(
  dateStr: string,
  rules: AvailabilityRules = AVAILABILITY_RULES
): boolean {
  const date = parseDateString(dateStr);
  const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

  // Check if date is blocked
  if (rules.blockedDates.includes(dateStr)) {
    return false;
  }

  // Check if within booking window
  const today = new Date();
  const daysAhead = Math.ceil(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysAhead < 0 || daysAhead > rules.maxDaysAhead) {
    return false;
  }

  // Check if minimum notice is met
  const hoursUntil = daysAhead * 24;
  if (hoursUntil < rules.minHoursNotice) {
    return false;
  }

  // Check if this day of week has availability
  const dayHours = rules.weeklyHours.find((h) => h.day === dayOfWeek);
  if (!dayHours) {
    return false; // No hours defined for this day
  }

  return true;
}

/**
 * Generate time slots for a specific date
 */
export function generateTimeSlots(
  dateStr: string,
  durationMinutes: number,
  existingBookings: Booking[] = [],
  rules: AvailabilityRules = AVAILABILITY_RULES
): TimeSlot[] {
  if (!isDateAvailable(dateStr, rules)) {
    return [];
  }

  const date = parseDateString(dateStr);
  const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const dayHours = rules.weeklyHours.find((h) => h.day === dayOfWeek);

  if (!dayHours) {
    return [];
  }

  const slots: TimeSlot[] = [];
  const slotDuration = rules.slotDurationMinutes;

  // Parse start and end times
  const [startHour, startMinute] = dayHours.start.split(':').map(Number);
  const [endHour, endMinute] = dayHours.end.split(':').map(Number);

  // Generate slots
  let currentHour = startHour;
  let currentMinute = startMinute;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute + durationMinutes <= endMinute)
  ) {
    const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    
    // Check if this slot conflicts with existing bookings
    const isAvailable = !hasBookingConflict(
      dateStr,
      timeStr,
      durationMinutes,
      existingBookings,
      rules
    );

    slots.push({
      time: timeStr,
      displayTime: formatTimeDisplay(timeStr),
      available: isAvailable,
    });

    // Move to next slot
    currentMinute += slotDuration;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  return slots;
}

/**
 * Check if a proposed booking conflicts with existing bookings
 */
function hasBookingConflict(
  dateStr: string,
  timeStr: string,
  durationMinutes: number,
  existingBookings: Booking[],
  rules: AvailabilityRules
): boolean {
  const [proposedHour, proposedMinute] = timeStr.split(':').map(Number);
  const proposedStart = proposedHour * 60 + proposedMinute;
  const proposedEnd = proposedStart + durationMinutes;
  const bufferBefore = rules.bufferMinutesBefore;
  const bufferAfter = rules.bufferMinutesAfter;

  for (const booking of existingBookings) {
    if (booking.date !== dateStr || booking.status !== 'confirmed') {
      continue;
    }

    const [bookingHour, bookingMinute] = booking.time.split(':').map(Number);
    const bookingStart = bookingHour * 60 + bookingMinute;
    const bookingEnd = bookingStart + booking.durationMinutes;

    // Check overlap including buffers
    const adjustedProposedStart = proposedStart - bufferBefore;
    const adjustedProposedEnd = proposedEnd + bufferAfter;
    const adjustedBookingStart = bookingStart - bufferBefore;
    const adjustedBookingEnd = bookingEnd + bufferAfter;

    // Overlap check: one starts before the other ends
    if (
      adjustedProposedStart < adjustedBookingEnd &&
      adjustedProposedEnd > adjustedBookingStart
    ) {
      return true; // Conflict found
    }
  }

  return false;
}

/**
 * Get availability for a date range
 */
export function getAvailabilityForRange(
  startDate: string,
  endDate: string,
  durationMinutes: number,
  existingBookings: Booking[] = [],
  rules: AvailabilityRules = AVAILABILITY_RULES
): DayAvailability[] {
  const days: DayAvailability[] = [];
  let currentDate = parseDateString(startDate);
  const end = parseDateString(endDate);

  while (currentDate <= end) {
    const dateStr = formatDateForInput(currentDate);
    const slots = generateTimeSlots(dateStr, durationMinutes, existingBookings, rules);

    days.push({
      date: dateStr,
      available: slots.some((s) => s.available),
      slots,
    });

    currentDate = addDays(currentDate, 1);
  }

  return days;
}

/**
 * Format time for display (24h to 12h)
 */
function formatTimeDisplay(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Count bookings for a specific date and event type
 */
export function countBookingsForDate(
  dateStr: string,
  eventTypeId: string,
  existingBookings: Booking[]
): number {
  return existingBookings.filter(
    (b) => b.date === dateStr && b.eventTypeId === eventTypeId && b.status === 'confirmed'
  ).length;
}

/**
 * Check if max bookings per day reached
 */
export function isMaxBookingsReached(
  dateStr: string,
  eventTypeId: string,
  maxPerDay: number,
  existingBookings: Booking[]
): boolean {
  const count = countBookingsForDate(dateStr, eventTypeId, existingBookings);
  return count >= maxPerDay;
}
