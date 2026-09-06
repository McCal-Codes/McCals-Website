import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import styles from './forms.module.css';
import { trackFormError, trackFormStart, trackFormStep, trackLead } from '@/utils/funnel';

const DRAFT_KEY = 'mcc_quote_draft_v2';

const SERVICE_TYPES = [
  'Event Photography',
  'Headshots',
  'Brand / Commercial',
  'Editorial',
  'Other',
] as const;

const DELIVERABLE_OPTIONS = [
  'Edited Photos',
  'Same-day Selects',
  'Social Media Content',
  'Prints/Albums',
] as const;

type ServiceType = (typeof SERVICE_TYPES)[number] | '';

export interface QuoteFormState {
  name: string;
  email: string;
  phone: string;
  organization: string;
  service_type: ServiceType;
  project_date: string;
  start_time: string;
  end_time: string;
  location: string;
  setting: string;
  attendees: string;
  deliverables: string[];
  other_deliverables: string;
  intended_use: string;
  duration: string;
  geographic: string;
  budget: string;
  timeline: string;
  notes: string;
}

const defaultState = (): QuoteFormState => ({
  name: '',
  email: '',
  phone: '',
  organization: '',
  service_type: '',
  project_date: '',
  start_time: '',
  end_time: '',
  location: '',
  setting: 'Indoor',
  attendees: '',
  deliverables: ['Edited Photos'],
  other_deliverables: '',
  intended_use: 'Internal use only',
  duration: '3 months',
  geographic: 'Local',
  budget: '$300–600',
  timeline: '',
  notes: '',
});

function loadDraft(): Partial<QuoteFormState> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<QuoteFormState>;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveDraft(state: QuoteFormState) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

export function QuoteRequestForm() {
  const hpId = useId();
  const [step, setStep] = useState(1);
  const [honeypot, setHoneypot] = useState('');
  const [state, setState] = useState<QuoteFormState>(() => {
    const draft = loadDraft();
    return draft ? { ...defaultState(), ...draft, deliverables: draft.deliverables?.length ? draft.deliverables : ['Edited Photos'] } : defaultState();
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const isEvent = state.service_type === 'Event Photography';

  // Fires once on mount so the funnel has a denominator: without a "reached the
  // form" event there is nothing to measure submissions against.
  useEffect(() => {
    trackFormStart('quote');
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => saveDraft(state), 400);
    return () => window.clearTimeout(t);
  }, [state]);

  const update = useCallback(<K extends keyof QuoteFormState>(key: K, value: QuoteFormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
    setBanner(null);
  }, []);

  const toggleDeliverable = useCallback((value: string) => {
    setState((prev) => {
      const has = prev.deliverables.includes(value);
      const deliverables = has
        ? prev.deliverables.filter((v) => v !== value)
        : [...prev.deliverables, value];
      return { ...prev, deliverables };
    });
    setBanner(null);
  }, []);

  const validateStep = useCallback(
    (s: number): boolean => {
      const err: Record<string, string> = {};
      if (s === 1) {
        if (!state.name.trim()) err.name = 'Name is required';
        if (!state.email.trim()) err.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) err.email = 'Enter a valid email';
      }
      if (s === 2) {
        if (!state.service_type) err.service_type = 'Choose a service type';
        if (!state.project_date) err.project_date = 'Date is required';
        if (isEvent) {
          if (!state.start_time) err.start_time = 'Start time is required';
          if (!state.end_time) err.end_time = 'End time is required';
          if (!state.attendees.trim()) err.attendees = 'Estimated attendees is required';
        }
      }
      if (s === 3) {
        if (!state.intended_use) err.intended_use = 'Choose an intended use';
        if (!state.duration) err.duration = 'Choose a duration of use';
        if (!state.geographic) err.geographic = 'Choose a geographic scope';
        if (!state.budget) err.budget = 'Choose a budget range';
      }
      setFieldErrors(err);
      return Object.keys(err).length === 0;
    },
    [isEvent, state],
  );

  const goNext = useCallback(() => {
    if (!validateStep(step)) return;
    const next = Math.min(step + 1, totalSteps);
    // Recorded per step: a single submit event cannot show which of the three
    // steps a visitor abandoned, and this form saves drafts, so drop-off is real.
    trackFormStep('quote', next, 'forward');
    setStep(next);
  }, [step, totalSteps, validateStep]);

  const goBack = useCallback(() => {
    setFieldErrors({});
    const previous = Math.max(step - 1, 1);
    trackFormStep('quote', previous, 'back');
    setStep(previous);
  }, [step]);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateStep(1)) {
        setStep(1);
        return;
      }
      if (!validateStep(2)) {
        setStep(2);
        return;
      }
      if (!validateStep(3)) return;

      setSubmitting(true);
      setBanner(null);

      const body: Record<string, unknown> = {
        name: state.name.trim(),
        email: state.email.trim(),
        service_type: state.service_type,
        project_date: state.project_date,
        intended_use: state.intended_use,
        duration: state.duration,
        geographic: state.geographic,
        budget: state.budget,
        phone: state.phone.trim() || undefined,
        organization: state.organization.trim() || undefined,
        start_time: state.start_time || undefined,
        end_time: state.end_time || undefined,
        location: state.location.trim() || undefined,
        setting: state.setting || undefined,
        attendees: state.attendees.trim() || undefined,
        deliverable: state.deliverables.length ? state.deliverables : undefined,
        other_deliverables: state.other_deliverables.trim() || undefined,
        timeline: state.timeline.trim() || undefined,
        notes: state.notes.trim() || undefined,
      };

      if (honeypot) body.mcc_valid_field = honeypot;

      try {
        const res = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };

        if (!res.ok) {
          trackFormError('quote', String(res.status));
          setBanner({
            type: 'error',
            text: data.error || 'Could not send your request. Try again.',
          });
          return;
        }

        trackLead('quote', {
          service_type: state.service_type || 'unspecified',
          budget: state.budget || 'unspecified',
        });

        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
        setBanner({
          type: 'success',
          text: "Thanks, your quote request was received. We'll follow up shortly.",
        });
        setState(defaultState());
        setStep(1);
      } catch {
        trackFormError('quote', 'network');
        setBanner({
          type: 'error',
          text: 'Network error. Email contact@mcc-cal.com if this keeps happening.',
        });
      } finally {
        setSubmitting(false);
      }
    },
    [honeypot, state, validateStep],
  );

  const inputClass = useCallback(
    (key: string) => `${styles.input} ${fieldErrors[key] ? styles.inputError : ''}`,
    [fieldErrors],
  );

  const selectClass = useCallback(
    (key: string) => `${styles.select} ${fieldErrors[key] ? styles.inputError : ''}`,
    [fieldErrors],
  );

  const stepHeading = useMemo(
    () => ['Contact details', 'Project & deliverables', 'Licensing & budget'][step - 1],
    [step],
  );

  return (
    <div className={styles.page}>
      <div className={`${styles.inner} ${styles.wide}`}>
        <header className={styles.header}>
          <h1>Request a Quote</h1>
          <p>
            Tell us about your project so we can reply with accurate pricing and availability.
          </p>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h4>Response time</h4>
              <p>Typically 1–2 business days</p>
            </div>
            <div className={styles.infoCard}>
              <h4>Commercial use</h4>
              <p>Usage and licensing may affect scope and fees</p>
            </div>
          </div>
          <div className={styles.progressTrack} aria-hidden>
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
          </div>
          <p style={{ marginTop: 16, color: '#888', fontSize: '0.9rem' }}>
            Step {step} of {totalSteps}: {stepHeading}
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

        <form className={styles.form} onSubmit={step === totalSteps ? submit : (e) => e.preventDefault()} noValidate>
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor={hpId}>Leave blank</label>
            <input
              id={hpId}
              name="mcc_valid_field"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(ev) => setHoneypot(ev.target.value)}
            />
          </div>

          <div className={styles.stepPanels}>
            <div className={`${styles.step} ${step === 1 ? styles.stepActive : ''}`} aria-hidden={step !== 1}>
              <div>
                <h2 className={styles.sectionTitle}>
                  Contact details
                </h2>
                <div className={`${styles.row} ${styles.row2}`}>
                  <div className={styles.field}>
                    <label htmlFor="quote-name">
                      Full name <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="quote-name"
                      className={inputClass('name')}
                      required
                      autoComplete="name"
                      value={state.name}
                      onChange={(ev) => update('name', ev.target.value)}
                      placeholder="Your name"
                    />
                    {fieldErrors.name && (
                      <span className={styles.bannerError} style={{ margin: 0, padding: '8px 10px' }}>
                        {fieldErrors.name}
                      </span>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="quote-email">
                      Email <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="quote-email"
                      type="email"
                      className={inputClass('email')}
                      required
                      autoComplete="email"
                      value={state.email}
                      onChange={(ev) => update('email', ev.target.value)}
                      placeholder="you@example.com"
                    />
                    {fieldErrors.email && (
                      <span className={styles.bannerError} style={{ margin: 0, padding: '8px 10px' }}>
                        {fieldErrors.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`${styles.row} ${styles.row2}`} style={{ marginTop: 18 }}>
                  <div className={styles.field}>
                    <label htmlFor="quote-phone">Phone</label>
                    <input
                      id="quote-phone"
                      type="tel"
                      className={styles.input}
                      autoComplete="tel"
                      value={state.phone}
                      onChange={(ev) => update('phone', ev.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="quote-org">Organization</label>
                    <input
                      id="quote-org"
                      className={styles.input}
                      autoComplete="organization"
                      value={state.organization}
                      onChange={(ev) => update('organization', ev.target.value)}
                      placeholder="Client or company"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.step} ${step === 2 ? styles.stepActive : ''}`} aria-hidden={step !== 2}>
              <div>
                <h2 className={styles.sectionTitle}>
                  Project details
                </h2>
                <div className={styles.field}>
                  <label htmlFor="quote-service">
                    Service type <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="quote-service"
                    className={selectClass('service_type')}
                    required
                    value={state.service_type}
                    onChange={(ev) => update('service_type', ev.target.value as ServiceType)}
                  >
                    <option value="">Select…</option>
                    {SERVICE_TYPES.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.service_type && (
                    <span className={styles.bannerError} style={{ margin: 0, padding: '8px 10px' }}>
                      {fieldErrors.service_type}
                    </span>
                  )}
                </div>

                <div className={`${styles.row} ${styles.row2}`}>
                  <div className={styles.field}>
                    <label htmlFor="quote-date">
                      Event or project date <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="quote-date"
                      type="date"
                      className={inputClass('project_date')}
                      required
                      value={state.project_date}
                      onChange={(ev) => update('project_date', ev.target.value)}
                    />
                    {fieldErrors.project_date && (
                      <span className={styles.bannerError} style={{ margin: 0, padding: '8px 10px' }}>
                        {fieldErrors.project_date}
                      </span>
                    )}
                  </div>
                  {isEvent ? (
                    <div className={styles.field}>
                      <label htmlFor="quote-start">
                        Start time <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="quote-start"
                        type="time"
                        className={inputClass('start_time')}
                        value={state.start_time}
                        onChange={(ev) => update('start_time', ev.target.value)}
                      />
                      {fieldErrors.start_time && (
                        <span className={styles.bannerError} style={{ margin: 0, padding: '8px 10px' }}>
                          {fieldErrors.start_time}
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>

                {isEvent ? (
                  <div className={`${styles.row} ${styles.row2}`}>
                    <div className={styles.field}>
                      <label htmlFor="quote-end">
                        End time <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="quote-end"
                        type="time"
                        className={inputClass('end_time')}
                        value={state.end_time}
                        onChange={(ev) => update('end_time', ev.target.value)}
                      />
                      {fieldErrors.end_time && (
                        <span className={styles.bannerError} style={{ margin: 0, padding: '8px 10px' }}>
                          {fieldErrors.end_time}
                        </span>
                      )}
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="quote-attendees">
                        Estimated attendees <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="quote-attendees"
                        type="text"
                        inputMode="numeric"
                        className={inputClass('attendees')}
                        value={state.attendees}
                        onChange={(ev) => update('attendees', ev.target.value)}
                        placeholder="e.g. 150"
                      />
                      {fieldErrors.attendees && (
                        <span className={styles.bannerError} style={{ margin: 0, padding: '8px 10px' }}>
                          {fieldErrors.attendees}
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}

                <div className={styles.field}>
                  <label htmlFor="quote-location">Location (city + venue)</label>
                  <input
                    id="quote-location"
                    className={styles.input}
                    value={state.location}
                    onChange={(ev) => update('location', ev.target.value)}
                    placeholder="Pittsburgh, PA (venue name)"
                  />
                </div>
                <div className={styles.field}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e0e0e0' }}>Setting</span>
                  <div className={styles.radioRow}>
                    <label className={styles.checkItem}>
                      <input
                        type="radio"
                        name="setting"
                        checked={state.setting === 'Indoor'}
                        onChange={() => update('setting', 'Indoor')}
                      />
                      Indoor
                    </label>
                    <label className={styles.checkItem}>
                      <input
                        type="radio"
                        name="setting"
                        checked={state.setting === 'Outdoor'}
                        onChange={() => update('setting', 'Outdoor')}
                      />
                      Outdoor
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h2 className={styles.sectionTitle}>
                  Deliverables
                </h2>
                <div className={styles.checkboxGrid}>
                  {DELIVERABLE_OPTIONS.map((opt) => (
                    <label key={opt} className={styles.checkItem}>
                      <input
                        type="checkbox"
                        checked={state.deliverables.includes(opt)}
                        onChange={() => toggleDeliverable(opt)}
                      />
                      {opt === 'Edited Photos' ? 'Edited high-resolution photos' : opt}
                    </label>
                  ))}
                </div>
                <div className={styles.field} style={{ marginTop: 12 }}>
                  <label htmlFor="quote-other-deliverables" className={styles.srOnly}>
                    Other deliverables
                  </label>
                  <input
                    id="quote-other-deliverables"
                    className={styles.input}
                    value={state.other_deliverables}
                    onChange={(ev) => update('other_deliverables', ev.target.value)}
                    placeholder="Other specific needs…"
                    aria-label="Other deliverables"
                  />
                </div>
              </div>
            </div>

            <div className={`${styles.step} ${step === 3 ? styles.stepActive : ''}`} aria-hidden={step !== 3}>
              <div>
                <h2 className={styles.sectionTitle}>
                  Licensing &amp; usage
                </h2>
                <div className={`${styles.row} ${styles.row2}`}>
                  <div className={styles.field}>
                    <label htmlFor="quote-use">
                      Intended use <span className={styles.required}>*</span>
                    </label>
                    <select
                      id="quote-use"
                      className={selectClass('intended_use')}
                      value={state.intended_use}
                      onChange={(ev) => update('intended_use', ev.target.value)}
                    >
                      <option>Internal use only</option>
                      <option>Social media</option>
                      <option>Website</option>
                      <option>Advertising / Marketing</option>
                      <option>Print</option>
                      <option>Unsure</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="quote-duration">
                      Duration of use <span className={styles.required}>*</span>
                    </label>
                    <select
                      id="quote-duration"
                      className={selectClass('duration')}
                      value={state.duration}
                      onChange={(ev) => update('duration', ev.target.value)}
                    >
                      <option>3 months</option>
                      <option>1 year</option>
                      <option>Perpetual</option>
                      <option>Unsure</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="quote-geo">
                      Geographic scope <span className={styles.required}>*</span>
                    </label>
                    <select
                      id="quote-geo"
                      className={selectClass('geographic')}
                      value={state.geographic}
                      onChange={(ev) => update('geographic', ev.target.value)}
                    >
                      <option>Local</option>
                      <option>National</option>
                      <option>Global</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <h2 className={styles.sectionTitle}>
                  Budget &amp; timeline
                </h2>
                <div className={`${styles.row} ${styles.row2}`}>
                  <div className={styles.field}>
                    <label htmlFor="quote-budget">
                      Budget range <span className={styles.required}>*</span>
                    </label>
                    <select
                      id="quote-budget"
                      className={selectClass('budget')}
                      value={state.budget}
                      onChange={(ev) => update('budget', ev.target.value)}
                    >
                      <option>$300–600</option>
                      <option>$600–1200</option>
                      <option>$1200–2500</option>
                      <option>$2500+</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="quote-timeline">Desired delivery timeline</label>
                    <input
                      id="quote-timeline"
                      className={styles.input}
                      value={state.timeline}
                      onChange={(ev) => update('timeline', ev.target.value)}
                      placeholder="e.g. Within two weeks"
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="quote-notes">Additional context</label>
                  <textarea
                    id="quote-notes"
                    className={styles.textarea}
                    value={state.notes}
                    onChange={(ev) => update('notes', ev.target.value)}
                    placeholder="Vision, references, constraints…"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.navRow}>
            {step > 1 ? (
              <button type="button" className={`${styles.submit} ${styles.secondary}`} onClick={goBack}>
                Back
              </button>
            ) : (
              <span />
            )}
            {step < totalSteps ? (
              <button type="button" className={styles.submit} onClick={goNext}>
                Next
              </button>
            ) : (
              <button type="submit" className={styles.submit} disabled={submitting}>
                {submitting ? 'Sending…' : 'Send quote request'}
              </button>
            )}
          </div>
          <p className={styles.hint}>
            By submitting, you agree we may contact you about this inquiry.
          </p>
        </form>
      </div>
    </div>
  );
}
