import { describe, expect, it } from 'vitest';
import { buildBookingEmails } from '../api/_lib/booking-emails.js';
import { BOOKING_CONFIGS, resolveLocation } from '../api/_lib/booking-config.js';

const config = BOOKING_CONFIGS['book-podcast'];

function makeBooking(overrides = {}) {
  return {
    id: 'booking-1',
    // 13:00Z is 9:00 AM Eastern on this date.
    start: { dateTime: '2026-09-08T13:00:00.000Z' },
    end: { dateTime: '2026-09-08T14:00:00.000Z' },
    requester: { name: 'Jane Doe', email: 'jane@example.com', notes: 'Excited to chat' },
    eventLink: 'https://calendar.google.com/event?eid=abc',
    ...overrides,
  };
}

describe('booking confirmation emails', () => {
  it("shows the requester their own timezone, not the server's", () => {
    const { requester } = buildBookingEmails({
      booking: makeBooking(),
      config,
      requesterTimezone: 'America/Los_Angeles',
      ownerEmail: 'contact@mcc-cal.com',
    });

    // 13:00Z is 6:00 AM Pacific. Before the timezone fix this rendered in the
    // runtime's zone, which is UTC on Vercel.
    expect(requester.html).toContain('6:00 AM PDT');
    expect(requester.html).not.toContain('UTC');
  });

  it("gives the owner the time in their zone plus the requester's", () => {
    const { owner } = buildBookingEmails({
      booking: makeBooking(),
      config,
      requesterTimezone: 'America/Los_Angeles',
      ownerEmail: 'contact@mcc-cal.com',
    });

    expect(owner.text).toContain('9:00 AM EDT');
    expect(owner.text).toContain('Their local time: 6:00 AM PDT (America/Los_Angeles)');
    expect(owner.text).toContain('6:00 AM PDT');
  });

  it('includes type, duration, location and notes', () => {
    const { requester, owner } = buildBookingEmails({
      booking: makeBooking(),
      config,
      ownerEmail: 'contact@mcc-cal.com',
    });

    expect(requester.html).toContain('Book a Podcast Recording');
    expect(requester.html).toContain('60 minutes');
    // Both parts are sent; the text alternative must carry the same facts.
    expect(requester.text).toContain('Book a Podcast Recording');
    expect(requester.html).toContain('Zoom or Google Meet');
    expect(requester.html).toContain('Excited to chat');
    expect(owner.text).toContain('Excited to chat');
  });

  it('attaches a calendar invite to both messages', () => {
    const { attachments, invite } = buildBookingEmails({
      booking: makeBooking(),
      config,
      ownerEmail: 'contact@mcc-cal.com',
    });

    expect(attachments).toHaveLength(1);
    expect(attachments[0].filename).toBe('booking.ics');
    expect(invite).toContain('BEGIN:VEVENT');
    expect(invite).toContain('DTSTART:20260908T130000Z');
    expect(invite).toContain('METHOD:REQUEST');
  });

  it('includes the manage link only when one was issued', () => {
    const withLink = buildBookingEmails({
      booking: makeBooking(),
      config,
      manageUrl: 'https://mcc-cal.com/manage-booking?token=abc',
      ownerEmail: 'contact@mcc-cal.com',
    });
    expect(withLink.requester.html).toContain('Reschedule or cancel');

    const withoutLink = buildBookingEmails({
      booking: makeBooking(),
      config,
      ownerEmail: 'contact@mcc-cal.com',
    });
    expect(withoutLink.requester.html).not.toContain('Reschedule or cancel');
  });

  it('never sends the manage token to the owner', () => {
    const { owner } = buildBookingEmails({
      booking: makeBooking(),
      config,
      manageUrl: 'https://mcc-cal.com/manage-booking?token=secret-token-value',
      ownerEmail: 'contact@mcc-cal.com',
    });

    expect(owner.text).not.toContain('secret-token-value');
  });

  it('escapes requester-supplied values so notes cannot inject markup', () => {
    const { requester } = buildBookingEmails({
      booking: makeBooking({
        requester: {
          name: '<script>alert(1)</script>',
          email: 'x@example.com',
          notes: '"><img src=x onerror=alert(1)>',
        },
      }),
      config,
      ownerEmail: 'contact@mcc-cal.com',
    });

    expect(requester.html).not.toContain('<script>');
    expect(requester.html).not.toContain('<img src=x');
    expect(requester.html).toContain('&lt;script&gt;');
  });

  it('omits the notes block entirely when none were given', () => {
    const { requester } = buildBookingEmails({
      booking: makeBooking({
        requester: { name: 'Jane', email: 'j@example.com' },
      }),
      config,
      ownerEmail: 'contact@mcc-cal.com',
    });

    expect(requester.html).not.toContain('Your notes:');
  });
});

describe('in-person bookings', () => {
  it('falls back to virtual when in person is chosen without an address', () => {
    // Better quietly virtual than a calendar entry that says "in person" and
    // gives nowhere to go.
    expect(resolveLocation(config, 'in-person', '   ')).toEqual({
      label: config.location,
      isInPerson: false,
    });
    expect(resolveLocation(config, 'in-person', undefined).isInPerson).toBe(false);
  });

  it('uses the supplied address when meeting in person', () => {
    expect(resolveLocation(config, 'in-person', '  Commonplace Coffee, Pittsburgh  ')).toEqual({
      label: 'Commonplace Coffee, Pittsburgh',
      isInPerson: true,
    });
  });

  it('ignores an address when the booking is virtual', () => {
    expect(resolveLocation(config, 'virtual', 'Somewhere else').isInPerson).toBe(false);
  });

  it('puts the address in both emails and the calendar invite', () => {
    const place = { label: 'Commonplace Coffee, Pittsburgh', isInPerson: true };
    const { requester, owner, invite } = buildBookingEmails({
      booking: makeBooking(),
      config,
      ownerEmail: 'contact@mcc-cal.com',
      location: place,
    });

    expect(requester.html).toContain('Commonplace Coffee, Pittsburgh');
    expect(requester.text).toContain('Commonplace Coffee, Pittsburgh');
    expect(owner.html).toContain('In person');
    // The calendar entry is what gets looked at on the day.
    expect(invite).toContain('LOCATION:Commonplace Coffee');
  });

  it('tells the owner travel is involved, and does not claim so otherwise', () => {
    const inPerson = buildBookingEmails({
      booking: makeBooking(), config, ownerEmail: 'c@mcc-cal.com',
      location: { label: 'Somewhere real', isInPerson: true },
    });
    expect(inPerson.owner.text).toContain('travel required');

    const virtual = buildBookingEmails({
      booking: makeBooking(), config, ownerEmail: 'c@mcc-cal.com',
    });
    expect(virtual.owner.text).not.toContain('travel required');
  });
});
