/**
 * Tokens for self-service booking management.
 *
 * A confirmation email links to a page that can cancel or move the booking, so
 * the token in that link is the only credential. It is therefore treated like a
 * password-reset token:
 *
 *   * 256 bits from a CSPRNG, so it cannot be guessed or enumerated.
 *   * Only the SHA-256 hash is stored. The raw value lives in the recipient's
 *     inbox and nowhere else, so a leaked database cannot be used to cancel
 *     or move anyone's booking.
 *   * Lookups hash the presented token and match on the indexed hash column,
 *     which is a constant-time equality inside Postgres rather than a
 *     byte-by-byte comparison in application code.
 */

import { createHash, randomBytes } from 'crypto';

/** How long a manage link keeps working after the booking is created. */
const TOKEN_TTL_DAYS = 180;

export function hashManageToken(token) {
  return createHash('sha256').update(String(token), 'utf8').digest('hex');
}

/**
 * @returns {{token: string, hash: string, expiresAt: string}}
 *   `token` goes in the email link; only `hash` and `expiresAt` are persisted.
 */
export function createManageToken() {
  // base64url keeps the token URL-safe without percent-encoding.
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  return { token, hash: hashManageToken(token), expiresAt: expiresAt.toISOString() };
}

/**
 * Absolute URL of the self-service page. Absolute because it is embedded in
 * email, where relative links have nothing to resolve against.
 */
export function buildManageUrl(token, siteUrl = process.env.VITE_SITE_URL || 'https://mcc-cal.com') {
  const base = String(siteUrl).replace(/\/$/, '');
  return `${base}/manage-booking?token=${encodeURIComponent(token)}`;
}
