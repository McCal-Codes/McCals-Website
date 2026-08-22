import { useCallback, useId, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from './forms.module.css';

const MIN_SUBMIT_DELAY_MS = 2500;
const SUBJECT_OPTIONS = [
  'General inquiry',
  'Photography services',
  'Editorial assignment',
  'Event coverage',
  'Corporate / brand',
  'Other',
];

function normalizeInitialSubject(value: string | null): string {
  if (!value) return '';
  const match = SUBJECT_OPTIONS.find((option) => option.toLowerCase() === value.toLowerCase());
  return match ?? '';
}

export function ContactForm() {
  const honeypotId = useId();
  const [searchParams] = useSearchParams();
  const [loadedAt] = useState(() => Date.now());
  const [honeypot, setHoneypot] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(() => normalizeInitialSubject(searchParams.get('subject')));
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const reset = useCallback(() => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setConsent(false);
    setHoneypot('');
  }, []);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setBanner(null);

      if (!consent) {
        setBanner({ type: 'error', text: 'Please accept the policies & legal information to continue.' });
        return;
      }

      if (Date.now() - loadedAt < MIN_SUBMIT_DELAY_MS) {
        setBanner({ type: 'error', text: 'Please wait a moment before submitting.' });
        return;
      }

      setSubmitting(true);
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim(),
            consent: true,
            contact_loaded_at: loadedAt,
            cf_website_url: honeypot || undefined,
          }),
        });

        const data = (await res.json().catch(() => ({}))) as { error?: string };

        if (!res.ok) {
          setBanner({
            type: 'error',
            text: data.error || 'Something went wrong. Please try again.',
          });
          return;
        }

        setBanner({
          type: 'success',
          text: "Thanks, your message is on its way. We'll get back to you soon.",
        });
        reset();
      } catch {
        setBanner({
          type: 'error',
          text: 'Network error. Try again or email contact@mcc-cal.com.',
        });
      } finally {
        setSubmitting(false);
      }
    },
    [consent, email, honeypot, loadedAt, message, name, reset, subject],
  );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1>Get in Touch</h1>
          <p>
            Have a question or want to work together? Send a message and we will respond as soon as
            we can.
          </p>
        </header>

        {banner && (
          <div
            className={`${styles.message} ${styles.messageVisible} ${banner.type === 'success' ? styles.success : styles.error}`}
            role={banner.type === 'success' ? 'status' : 'alert'}
          >
            {banner.text}
          </div>
        )}

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor={honeypotId}>Company website</label>
            <input
              id={honeypotId}
              name="cf_website_url"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(ev) => setHoneypot(ev.target.value)}
            />
          </div>

          <div className={`${styles.row} ${styles.row2}`}>
            <div className={styles.field}>
              <label htmlFor="contact-name">
                Name <span className={styles.required}>*</span>
              </label>
              <input
                id="contact-name"
                className={styles.input}
                name="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(ev) => {
                  setName(ev.target.value);
                  setBanner(null);
                }}
                placeholder="Your name"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="contact-email">
                Email <span className={styles.required}>*</span>
              </label>
              <input
                id="contact-email"
                className={styles.input}
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(ev) => {
                  setEmail(ev.target.value);
                  setBanner(null);
                }}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="contact-subject">
              Subject <span className={styles.required}>*</span>
            </label>
            <select
              id="contact-subject"
              className={styles.select}
              name="subject"
              required
              value={subject}
              onChange={(ev) => {
                setSubject(ev.target.value);
                setBanner(null);
              }}
            >
              <option value="">Select a topic…</option>
              {SUBJECT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="contact-message">
              Message <span className={styles.required}>*</span>
            </label>
            <textarea
              id="contact-message"
              className={styles.textarea}
              name="message"
              required
              value={message}
              onChange={(ev) => {
                setMessage(ev.target.value);
                setBanner(null);
              }}
              placeholder="Tell us about your project or question…"
            />
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              name="consent"
              required
              checked={consent}
              onChange={(ev) => {
                setConsent(ev.target.checked);
                setBanner(null);
              }}
            />
            <span>
              I agree to the{' '}
              <Link to="/privacy" className={styles.privacyLink}>
                privacy policy
              </Link>{' '}
              and{' '}
              <Link to="/terms" className={styles.privacyLink}>
                terms
              </Link>
              , and consent to being contacted about this inquiry.{' '}
              <span className={styles.required}>*</span>
            </span>
          </label>

          <div className={styles.actions}>
            <button type="submit" className={styles.submit} disabled={submitting}>
              {submitting ? 'Sending…' : 'Send message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
