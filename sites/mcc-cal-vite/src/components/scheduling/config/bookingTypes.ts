import type { EventType } from '../types/booking';

/**
 * Extended event type configuration
 * Supports separate booking flows for Coffee and Podcast
 */

export interface ExtendedEventType extends EventType {
  slug: string;
  route: string;
  headerClass: string;
  displayClass: string;
  pageTitle: string;
  pageDescription: string;
  confirmationTitle: string;
  confirmationMessage: string;
  /** Whether this type can be booked in person as well as remotely. */
  allowInPerson?: boolean;
  formLabels: {
    namePlaceholder: string;
    emailPlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
  };
}

export const BOOKING_TYPES: Record<string, ExtendedEventType> = {
  coffee: {
    id: 'grab-coffee',
    slug: 'coffee',
    route: '/grab-a-coffee',
    name: 'Grab a Coffee',
    description: 'A casual 30-minute conversation to connect, ask questions, or explore potential collaborations over a virtual coffee. No pressure, just good conversation.',
    durationMinutes: 30,
    color: '#c9a86c',
    location: 'Google Meet',
    allowInPerson: true,
    maxPerDay: 4,
    headerClass: 'scheduling-header--coffee',
    displayClass: 'scheduling-event-display--coffee',
    pageTitle: 'Grab a Coffee | Caleb McCartney',
    pageDescription: 'Schedule a casual virtual coffee chat with Caleb McCartney to connect, ask questions, or explore potential collaborations.',
    confirmationTitle: 'Coffee chat booked',
    confirmationMessage: "Looking forward to it. A confirmation is on its way to your email.",
    formLabels: {
      namePlaceholder: 'Your name',
      emailPlaceholder: 'your@email.com',
      notesLabel: 'What would you like to chat about? (optional)',
      notesPlaceholder: 'Tell me a bit about yourself, what you do, or what you\'d like to discuss...',
    },
  },
  podcast: {
    id: 'book-podcast',
    slug: 'podcast',
    route: '/book-a-podcast',
    name: 'Book a Podcast Recording',
    description: 'Schedule a 60-minute recording session for the Caffeinated Connections podcast. We\'ll have a great conversation about your work, creative process, and the stories behind what you do.',
    durationMinutes: 60,
    color: '#7dd3fc',
    location: 'Zoom or Google Meet',
    allowInPerson: true,
    maxPerDay: 2,
    headerClass: 'scheduling-header--podcast',
    displayClass: 'scheduling-event-display--podcast',
    pageTitle: 'Book a Podcast Recording | Caffeinated Connections',
    pageDescription: 'Schedule a podcast recording session with Caleb McCartney for Caffeinated Connections. Share your story and connect with listeners.',
    confirmationTitle: 'Podcast session booked',
    confirmationMessage: "We're all set to record. A confirmation is on its way to your email.",
    formLabels: {
      namePlaceholder: 'Your full name',
      emailPlaceholder: 'your@email.com',
      notesLabel: 'Tell me about what you\'d like to discuss (optional)',
      notesPlaceholder: 'Share a bit about your work, recent projects, or topics you\'d love to dive into on the show...',
    },
  },
};

export function getBookingType(slug: string): ExtendedEventType | undefined {
  return BOOKING_TYPES[slug];
}

export function getAllBookingTypes(): ExtendedEventType[] {
  return Object.values(BOOKING_TYPES);
}

export function getBookingTypeById(id: string): ExtendedEventType | undefined {
  return Object.values(BOOKING_TYPES).find((type) => type.id === id);
}
