/**
 * Conversion funnel instrumentation.
 *
 * Before this, three events fired site-wide (page_view, error_boundary_caught
 * and links_page_view), and none of them on a revenue path. There was no way to
 * see which galleries produce enquiries or where the three-step quote form
 * loses people, even though it saves drafts to localStorage and abandonment is
 * demonstrably real.
 *
 * `generate_lead` is GA4's *recommended* event for form submissions and
 * signups rather than a custom name. Using it populates the Lead acquisition
 * report and makes leads audiences available, which custom events do not.
 * Everything else here is a custom event, since GA4 defines no recommended
 * equivalent. Enhanced Measurement also collects form_start / form_submit
 * automatically, but those cannot distinguish the quote form's steps.
 *
 * Every call routes through trackWebsiteEvent, which is consent-gated.
 */

import { trackWebsiteEvent } from './analytics';

/** Where a lead came from, so the report can be segmented by path. */
export type LeadSource = 'contact' | 'quote' | 'booking' | 'newsletter';

/**
 * GA4's recommended lead event. `value` and `currency` are optional in the
 * spec; they are omitted here because an enquiry has no known value at
 * submission time, and a fabricated one would corrupt the report.
 */
export function trackLead(source: LeadSource, params?: Record<string, string | number>): void {
  trackWebsiteEvent('generate_lead', { lead_source: source, ...params });
}

/** Someone reached a form and it became interactive. */
export function trackFormStart(formName: string): void {
  trackWebsiteEvent('form_started', { form_name: formName });
}

/**
 * A step transition inside a multi-step form. The quote form's drop-off is
 * invisible without this. A single submit event cannot show which step lost
 * the visitor.
 */
export function trackFormStep(formName: string, step: number, direction: 'forward' | 'back'): void {
  trackWebsiteEvent('form_step', { form_name: formName, step, direction });
}

/** A submission that the server rejected, so failures are separable from drop-off. */
export function trackFormError(formName: string, reason: string): void {
  trackWebsiteEvent('form_error', { form_name: formName, reason });
}

/**
 * A gallery opened in the lightbox. The identifier is the group's own id, the
 * same public slug the manifest already exposes, rather than a filename or a
 * full URL.
 */
export function trackImageView(gallery: string, imageId: string): void {
  trackWebsiteEvent('image_view', { gallery, image_id: imageId });
}

/** A call to action clicked, so gallery CTAs can be compared against each other. */
export function trackCtaClick(location: string, destination: string): void {
  trackWebsiteEvent('cta_click', { cta_location: location, cta_destination: destination });
}

/** Booking flow progress, mirroring the steps in useBooking. */
export function trackBookingStep(
  bookingType: string,
  step: 'started' | 'date_selected' | 'time_selected' | 'confirmed'
): void {
  trackWebsiteEvent('booking_step', { booking_type: bookingType, step });
}
