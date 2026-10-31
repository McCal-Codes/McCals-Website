import { describe, expect, it, vi } from 'vitest';
import { sendEmailOrThrow } from '../api/_lib/email.js';

/**
 * Resend resolves with `{ data, error }` instead of rejecting when the API
 * refuses a message, so a plain `await resend.emails.send(...)` inside a
 * try/catch silently swallowed every failure, an unverified sending domain,
 * an exhausted quota, a bad key. The enquiry looked emailed and was not.
 */
describe('sendEmailOrThrow', () => {
  it('returns the payload when Resend accepts the message', async () => {
    const resend = { emails: { send: vi.fn(async () => ({ data: { id: 'email_1' }, error: null })) } };
    await expect(sendEmailOrThrow(resend, { to: 'a@b.com' })).resolves.toEqual({ id: 'email_1' });
  });

  it('throws when Resend refuses it, rather than resolving quietly', async () => {
    const resend = {
      emails: {
        send: vi.fn(async () => ({
          data: null,
          // What an unverified sending domain actually returns.
          error: { name: 'invalid_from_address', message: 'The from address is not verified' },
        })),
      },
    };

    await expect(sendEmailOrThrow(resend, { to: 'a@b.com' })).rejects.toThrow(
      /invalid_from_address/
    );
  });

  it('surfaces a quota failure with its code attached', async () => {
    const resend = {
      emails: {
        send: vi.fn(async () => ({
          data: null,
          error: { name: 'daily_quota_exceeded', message: 'Daily quota reached' },
        })),
      },
    };

    await expect(sendEmailOrThrow(resend, {})).rejects.toMatchObject({
      code: 'daily_quota_exceeded',
    });
  });
});
