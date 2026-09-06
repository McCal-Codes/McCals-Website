/**
 * Sending helper for Resend.
 *
 * The SDK resolves with `{ data, error }` rather than rejecting when the API
 * refuses a message, so `await resend.emails.send(...)` inside a try/catch
 * looks safe and is not: an unverified sending domain
 * (`invalid_from_address`), an exhausted quota (`daily_quota_exceeded`) or a
 * bad key all resolve normally and the catch block never runs. Every failure
 * was therefore invisible: the booking or enquiry appeared to have been
 * emailed when nothing was sent.
 *
 * This converts that into a thrown error so the existing catch blocks, which
 * already log and report to Sentry, actually see it.
 */
export async function sendEmailOrThrow(resend, payload) {
  const { data, error } = await resend.emails.send(payload);

  if (error) {
    const detail = [error.name, error.message].filter(Boolean).join(': ');
    const failure = new Error(`Resend refused the email - ${detail || 'unknown error'}`);
    failure.code = error.name;
    throw failure;
  }

  return data;
}
