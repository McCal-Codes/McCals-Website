import { Layout } from '@/components';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useBooking } from '@/components/scheduling/hooks/useBooking';
import { CalendarPicker } from '@/components/scheduling/components/CalendarPicker';
import { TimeSlotGrid } from '@/components/scheduling/components/TimeSlotGrid';
import { BookingForm } from '@/components/scheduling/components/BookingForm';
import { ConfirmationView } from '@/components/scheduling/components/ConfirmationView';
import { getBookingType } from '@/components/scheduling/config/bookingTypes';
import { PODCAST_IMAGE } from '@/components/podcast/constants';
import { formatDateWithTimezone, getRequesterTimezone } from '@/components/scheduling/utils/timezone';
import type { DayAvailability, LocationMode, RequesterInfo } from '@/components/scheduling/types/booking';
import '@/styles/scheduling.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const BOOKING_TYPE = getBookingType('podcast')!;

export default function BookPodcastPage() {
  usePageMeta({
    title: BOOKING_TYPE.pageTitle,
    description: BOOKING_TYPE.pageDescription,
    canonical: `${SITE_URL}${BOOKING_TYPE.route}`,
    og: {
      type: 'website',
      title: BOOKING_TYPE.pageTitle,
      description: BOOKING_TYPE.pageDescription,
      image: PODCAST_IMAGE,
    },
    twitter: {
      card: 'summary_large_image',
      title: BOOKING_TYPE.pageTitle,
      description: BOOKING_TYPE.pageDescription,
      image: PODCAST_IMAGE,
    },
  });

  const {
    state,
    selectDate,
    selectTime,
    submitBookingDetails,
    goBack,
    reset,
    availability,
    isLoadingAvailability,
    availabilityError,
  } = useBooking(BOOKING_TYPE.id);

  const requesterTimezone = getRequesterTimezone();

  const selectedDayAvailability: DayAvailability | undefined = state.selectedDate
    ? availability.find((d) => d.date === state.selectedDate)
    : undefined;

  const dateDisplay = state.selectedDate
    ? formatDateWithTimezone(state.selectedDate, requesterTimezone, 'full')
    : '';

  const handleSubmit = async (
    info: RequesterInfo,
    hpField: string,
    place: { locationMode: LocationMode; locationDetail: string },
  ) => {
    await submitBookingDetails(info, hpField, place);
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'selecting-date', label: 'Date' },
      { id: 'selecting-time', label: 'Time' },
      { id: 'entering-details', label: 'Details' },
      { id: 'confirmed', label: 'Done' },
    ];

    const currentStepIndex = steps.findIndex((s) => s.id === state.step);

    return (
      <div className="scheduling-steps" aria-label="Booking progress">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;

          return (
            <div
              key={step.id}
              className={`scheduling-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="scheduling-step-number">
                {isCompleted ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span className="scheduling-step-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (state.step) {
      case 'selecting-date':
        return (
          <>
            {isLoadingAvailability && (
              <div className="scheduling-loading">
                <span className="scheduling-spinner" />
                <p>Loading availability...</p>
              </div>
            )}
            {availabilityError && (
              <div className="scheduling-error" role="alert">
                <p>{availabilityError}</p>
                <button className="scheduling-btn-secondary" onClick={() => window.location.reload()}>
                  Try Again
                </button>
              </div>
            )}
            {!isLoadingAvailability && !availabilityError && (
              <CalendarPicker
                availability={availability}
                selectedDate={state.selectedDate}
                onSelectDate={selectDate}
              />
            )}
          </>
        );

      case 'selecting-time':
        return (
          <>
            <TimeSlotGrid
              slots={selectedDayAvailability?.slots || []}
              selectedTime={state.selectedTime}
              onSelectTime={selectTime}
              dateDisplay={dateDisplay}
            />
            <button className="scheduling-back-btn" onClick={goBack}>
              ← Back to calendar
            </button>
          </>
        );

      case 'entering-details':
        return (
          <BookingForm
            onSubmit={handleSubmit}
            onBack={goBack}
            isLoading={state.isLoading}
            eventName={BOOKING_TYPE.name}
            defaultLocation={BOOKING_TYPE.location}
            allowInPerson={BOOKING_TYPE.allowInPerson}
            dateDisplay={dateDisplay}
            timeDisplay={state.selectedTime || ''}
            formLabels={BOOKING_TYPE.formLabels}
          />
        );

      case 'confirmed':
        return state.confirmedBooking ? (
          <ConfirmationView
            booking={state.confirmedBooking}
            bookingType={BOOKING_TYPE}
            requesterTimezone={requesterTimezone}
            onBookAnother={reset}
          />
        ) : null;

      default:
        return null;
    }
  };

  // API unavailable fallback
  if (availabilityError && availabilityError.includes('Failed to load')) {
    return (
      <Layout>
        <div className="scheduling-page">
          <div className="scheduling-container">
            <header className={`scheduling-header ${BOOKING_TYPE.headerClass}`}>
              <h1 className="scheduling-title">{BOOKING_TYPE.name}</h1>
              <p className="scheduling-subtitle">{BOOKING_TYPE.description}</p>
            </header>
            <div className="scheduling-error mt-8" role="alert">
              <p>Scheduling is temporarily unavailable.</p>
              <p className="text-sm opacity-80 mt-2">
                Please email me directly at <a href="mailto:contact@mcc-cal.com">contact@mcc-cal.com</a> to book a podcast recording.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="scheduling-page">
        <div className="scheduling-container">
          <header className={`scheduling-header ${BOOKING_TYPE.headerClass}`}>
            <h1 className="scheduling-title">{BOOKING_TYPE.name}</h1>
            <p className="scheduling-subtitle">{BOOKING_TYPE.description}</p>
          </header>

          {state.step !== 'confirmed' && renderStepIndicator()}

          <div className="scheduling-content">
            {state.error && (
              <div className="scheduling-error-banner" role="alert">
                <p>{state.error}</p>
              </div>
            )}

            {/* Event Display Card */}
            {state.step !== 'confirmed' && (
              <div className={`scheduling-event-display ${BOOKING_TYPE.displayClass}`}>
                <div className="scheduling-event-header">
                  <span className="scheduling-event-indicator" />
                  <h3 className="scheduling-event-name">{BOOKING_TYPE.name}</h3>
                </div>
                <p className="scheduling-event-description">{BOOKING_TYPE.description}</p>
                <div className="scheduling-event-meta">
                  <span className="scheduling-event-duration">
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
                    </svg>
                    {BOOKING_TYPE.durationMinutes} minutes
                  </span>
                  <span className="scheduling-event-location">
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    {BOOKING_TYPE.location}
                  </span>
                </div>
              </div>
            )}

            {renderStepContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
}
