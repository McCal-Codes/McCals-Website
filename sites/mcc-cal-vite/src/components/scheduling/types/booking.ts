/**
 * Booking types for the scheduling system
 * Mirrors Calendly's core data model
 */

export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  color: string;
  location: string;
  maxPerDay?: number;
}

export interface WeeklyHours {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  start: string; // 24h format "HH:mm"
  end: string; // 24h format "HH:mm"
}

export interface AvailabilityRules {
  timezone: string; // IANA timezone identifier e.g., "America/New_York"
  weeklyHours: WeeklyHours[];
  blockedDates: string[]; // ISO date strings YYYY-MM-DD
  maxDaysAhead: number; // How far ahead people can book
  minHoursNotice: number; // Minimum notice required
  slotDurationMinutes: number; // Default 30
  bufferMinutesBefore: number; // Buffer before meeting
  bufferMinutesAfter: number; // Buffer after meeting
}

export interface RequesterInfo {
  name: string;
  email: string;
  notes?: string;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  date: string; // ISO date YYYY-MM-DD
  time: string; // 24h format HH:mm (in owner's timezone)
  durationMinutes: number;
  requester: RequesterInfo;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string; // ISO timestamp
  requesterTimezone: string;
  ownerTimezone: string;
}

export interface TimeSlot {
  time: string; // 24h format HH:mm (owner's timezone)
  displayTime: string; // Formatted for display in requester's timezone
  available: boolean;
}

export interface DayAvailability {
  date: string; // ISO date YYYY-MM-DD
  available: boolean;
  slots: TimeSlot[];
}

export type BookingStep =
  | 'selecting-event'
  | 'selecting-date'
  | 'selecting-time'
  | 'entering-details'
  | 'confirmed';

export interface BookingState {
  step: BookingStep;
  selectedEventType: EventType | null;
  selectedDate: string | null;
  selectedTime: string | null;
  requesterInfo: RequesterInfo | null;
  confirmedBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
}
