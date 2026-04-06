/**
 * Booking types for the admin scheduling system
 * Mirrors the public site booking types
 */

export interface RequesterInfo {
  name: string;
  email: string;
  notes?: string;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  eventTypeId: string;
  date: string; // ISO date YYYY-MM-DD
  time: string; // 24h format HH:mm (in owner's timezone)
  durationMinutes: number;
  requester: RequesterInfo;
  status: BookingStatus;
  createdAt: string; // ISO timestamp
  requesterTimezone: string;
  ownerTimezone: string;
}

export interface BookingDerived {
  isPast: boolean;
  isToday: boolean;
  dayOfWeek: string;
  formattedDate: string;
}

export interface BookingWithDerived extends Booking {
  derived: BookingDerived;
}

export interface BookingSummary {
  total: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  upcoming: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BookingsFilter {
  startDate?: string;
  endDate?: string;
  status?: BookingStatus | null;
  eventType?: string;
  email?: string;
}

export interface BookingsResponse {
  ok: boolean;
  data: Booking[];
  pagination: PaginationInfo;
  summary: BookingSummary;
  filters: {
    applied: BookingsFilter;
  };
  meta: {
    operator: string;
    timestamp: string;
  };
}

export interface BookingDetailResponse {
  ok: boolean;
  data: BookingWithDerived;
  related: {
    sameRequester: Booking[];
    sameDate: Booking[];
  };
  meta: {
    operator: string;
    timestamp: string;
  };
}

export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  color: string;
  location: string;
  maxPerDay?: number;
}

// Extended event types used in the public site
export interface ExtendedEventType extends EventType {
  slug: string;
  route: string;
  headerClass: string;
  displayClass: string;
  pageTitle: string;
  pageDescription: string;
  confirmationTitle: string;
  confirmationMessage: string;
  formLabels: {
    namePlaceholder: string;
    emailPlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
  };
}
