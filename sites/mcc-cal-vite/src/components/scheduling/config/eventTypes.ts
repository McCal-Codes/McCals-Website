import type { EventType } from '../types/booking.js';

/**
 * Event type configuration
 * Define the types of meetings people can book
 */

export const EVENT_TYPES: EventType[] = [
  {
    id: 'coffee-chat',
    name: 'Coffee Chat',
    description: 'A casual 20-minute conversation to connect, ask questions, or explore potential collaborations. No pressure, just good conversation.',
    durationMinutes: 20,
    color: 'var(--mcc-event-coffee, #c9a86c)', // Warm gold - harmonizes with taupe
    location: 'Virtual (Google Meet or Zoom)',
    maxPerDay: 3,
  },
  {
    id: 'consultation',
    name: 'Project Consultation',
    description: 'A focused 45-minute discussion about your photography needs, project scope, timeline, and how we can work together.',
    durationMinutes: 45,
    color: 'var(--mcc-event-consultation, #7fb5c9)', // Muted teal - harmonizes with taupe
    location: 'Virtual (Google Meet or Zoom)',
    maxPerDay: 2,
  },
];

export function getEventTypeById(id: string): EventType | undefined {
  return EVENT_TYPES.find((event) => event.id === id);
}

export function getAllEventTypes(): EventType[] {
  return [...EVENT_TYPES];
}
