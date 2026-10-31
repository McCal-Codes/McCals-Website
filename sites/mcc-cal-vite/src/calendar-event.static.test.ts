import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guard: the Google Calendar event must not carry an `attendees` field.
 *
 * Google refuses an event with attendees when it is created by a service
 * account without Domain-Wide Delegation, answering "Service accounts cannot
 * invite attendees without Domain-Wide Delegation of Authority". This site
 * authenticates with a plain service account.
 *
 * That refusal is not survivable: createCalendarEvent throws on a non-OK
 * response, the throw escapes before the Supabase insert and before either
 * confirmation email, so re-adding the field would lose the booking record and
 * both emails along with the calendar entry. The requester still gets a
 * calendar entry from the .ics attachment and the Add to Google Calendar link
 * in their confirmation.
 *
 * A static read rather than a call, because createCalendarEvent is internal to
 * the route and only runs when Google credentials are configured.
 */
const bookSource = readFileSync(join(__dirname, '..', 'api', 'schedule', 'book.js'), 'utf8');

describe('Google Calendar event payload', () => {
  it('does not invite the requester as an attendee', () => {
    // Matches the object property, not the word inside the explaining comment.
    const attendeeProperty = /^\s*attendees\s*:/m;
    expect(attendeeProperty.test(bookSource)).toBe(false);
  });

  it('still records who booked, in the event description', () => {
    expect(bookSource).toContain('Booking with ${requester.name}');
    expect(bookSource).toContain('Email: ${requester.email}');
  });

  it('keeps the reason documented next to the code', () => {
    // If someone deletes the explanation they will re-add the field, so the
    // comment is part of the guarantee.
    expect(bookSource).toContain('Domain-Wide Delegation');
  });
});
