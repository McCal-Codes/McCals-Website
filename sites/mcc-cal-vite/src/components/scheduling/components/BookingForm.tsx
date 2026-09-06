import { useState, useCallback } from 'react';
import type { LocationMode, RequesterInfo } from '../types/booking';

interface FormLabels {
  namePlaceholder: string;
  emailPlaceholder: string;
  notesLabel: string;
  notesPlaceholder: string;
}

interface BookingFormProps {
  /** `hpField` is the honeypot value; the server rejects the booking when it is non-empty. */
  onSubmit: (
    info: RequesterInfo,
    hpField: string,
    place: { locationMode: LocationMode; locationDetail: string },
  ) => void;
  onBack: () => void;
  isLoading: boolean;
  eventName: string;
  dateDisplay: string;
  timeDisplay: string;
  /** Where the session happens by default, e.g. "Zoom or Google Meet". */
  defaultLocation: string;
  /** Offers the in-person choice. Types that cannot travel simply omit it. */
  allowInPerson?: boolean;
  formLabels?: FormLabels;
}

interface FormErrors {
  name?: string;
  email?: string;
}

const defaultFormLabels: FormLabels = {
  namePlaceholder: 'Your name',
  emailPlaceholder: 'your@email.com',
  notesLabel: 'Notes (optional)',
  notesPlaceholder: 'What would you like to discuss? Any questions or topics?',
};

export function BookingForm({
  onSubmit,
  onBack,
  isLoading,
  eventName,
  dateDisplay,
  timeDisplay,
  defaultLocation,
  allowInPerson = false,
  formLabels = defaultFormLabels,
}: BookingFormProps) {
  const [formData, setFormData] = useState<RequesterInfo>({
    name: '',
    email: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  // Honeypot. Kept out of `formData` so it is never validated, and never
  // mistaken for something to persist alongside the requester's details.
  const [hpField, setHpField] = useState('');
  const [locationMode, setLocationMode] = useState<LocationMode>('virtual');
  const [locationDetail, setLocationDetail] = useState('');
  // Only blocks submission when in person is actually chosen.
  const [locationError, setLocationError] = useState<string | undefined>();

  const validateField = useCallback((name: keyof RequesterInfo, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return undefined;
      case 'email': {
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email';
        return undefined;
      }
      default:
        return undefined;
    }
  }, []);

  const handleChange = useCallback(
    (field: keyof RequesterInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (field: keyof RequesterInfo) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, formData[field] || '');
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData, validateField]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Validate all fields
      const newErrors: FormErrors = {};
      let hasErrors = false;

      (Object.keys(formData) as Array<keyof RequesterInfo>).forEach((key) => {
        if (key !== 'notes') {
          const error = validateField(key, formData[key] || '');
          if (error) {
            newErrors[key] = error;
            hasErrors = true;
          }
        }
      });

      setErrors(newErrors);
      setTouched({ name: true, email: true, notes: true });

      // An in-person booking without somewhere to be is not a booking.
      if (locationMode === 'in-person' && !locationDetail.trim()) {
        setLocationError('Add where you would like to meet');
        return;
      }
      setLocationError(undefined);

      if (!hasErrors) {
        onSubmit(formData, hpField, { locationMode, locationDetail: locationDetail.trim() });
      }
    },
    [formData, hpField, locationDetail, locationMode, onSubmit, validateField]
  );

  return (
    <div className="scheduling-booking-form">
      <h2 className="scheduling-step-title">Enter your details</h2>
      <p className="scheduling-step-description">
        {eventName} on {dateDisplay} at {timeDisplay}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Honeypot field - hidden from users, catches bots */}
        <div className="scheduling-honeypot" aria-hidden="true">
          <input
            type="text"
            name="hp_field"
            tabIndex={-1}
            autoComplete="off"
            value={hpField}
            onChange={(e) => setHpField(e.target.value)}
          />
        </div>

        <div className={`scheduling-form-field ${errors.name && touched.name ? 'has-error' : ''}`}>
          <label htmlFor="booking-name">
            Name <span aria-label="required">*</span>
          </label>
          <input
            id="booking-name"
            type="text"
            value={formData.name}
            onChange={handleChange('name')}
            onBlur={handleBlur('name')}
            placeholder={formLabels.namePlaceholder}
            disabled={isLoading}
            aria-invalid={!!errors.name && touched.name}
            aria-describedby={errors.name && touched.name ? 'name-error' : undefined}
          />
          {errors.name && touched.name && (
            <span id="name-error" className="scheduling-field-error" role="alert">
              {errors.name}
            </span>
          )}
        </div>

        <div className={`scheduling-form-field ${errors.email && touched.email ? 'has-error' : ''}`}>
          <label htmlFor="booking-email">
            Email <span aria-label="required">*</span>
          </label>
          <input
            id="booking-email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
            placeholder={formLabels.emailPlaceholder}
            disabled={isLoading}
            autoComplete="email"
            aria-invalid={!!errors.email && touched.email}
            aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
          />
          {errors.email && touched.email && (
            <span id="email-error" className="scheduling-field-error" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        {allowInPerson && (
          <fieldset className="scheduling-form-field scheduling-location">
            <legend>How would you like to meet?</legend>

            <label className="scheduling-location__option">
              <input
                type="radio"
                name="locationMode"
                value="virtual"
                checked={locationMode === 'virtual'}
                onChange={() => {
                  setLocationMode('virtual');
                  setLocationError(undefined);
                }}
                disabled={isLoading}
              />
              <span>
                Online <span className="scheduling-location__hint">{defaultLocation}</span>
              </span>
            </label>

            <label className="scheduling-location__option">
              <input
                type="radio"
                name="locationMode"
                value="in-person"
                checked={locationMode === 'in-person'}
                onChange={() => setLocationMode('in-person')}
                disabled={isLoading}
              />
              <span>
                In person <span className="scheduling-location__hint">around Pittsburgh</span>
              </span>
            </label>

            {locationMode === 'in-person' && (
              <div className={`scheduling-form-field ${locationError ? 'has-error' : ''}`}>
                <label htmlFor="booking-location">
                  Where <span aria-label="required">*</span>
                </label>
                <input
                  id="booking-location"
                  type="text"
                  value={locationDetail}
                  onChange={(e) => {
                    setLocationDetail(e.target.value);
                    if (locationError) setLocationError(undefined);
                  }}
                  placeholder="Cafe, venue or address"
                  disabled={isLoading}
                  maxLength={200}
                  aria-invalid={!!locationError}
                  aria-describedby={locationError ? 'location-error' : 'location-hint'}
                />
                {locationError ? (
                  <span id="location-error" className="scheduling-field-error" role="alert">
                    {locationError}
                  </span>
                ) : (
                  <span id="location-hint" className="scheduling-char-count">
                    A name is enough, I&apos;ll confirm the exact spot by email.
                  </span>
                )}
              </div>
            )}
          </fieldset>
        )}

        <div className="scheduling-form-field">
          <label htmlFor="booking-notes">{formLabels.notesLabel}</label>
          <textarea
            id="booking-notes"
            value={formData.notes}
            onChange={handleChange('notes')}
            placeholder={formLabels.notesPlaceholder}
            disabled={isLoading}
            rows={4}
            maxLength={500}
          />
          <span className="scheduling-char-count">{formData.notes?.length || 0}/500</span>
        </div>

        <div className="scheduling-form-actions">
          <button
            type="button"
            className="scheduling-btn-secondary"
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </button>
          <button
            type="submit"
            className="scheduling-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="scheduling-spinner" aria-hidden="true" />
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
