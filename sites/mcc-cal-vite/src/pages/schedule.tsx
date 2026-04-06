import { Layout } from '@/components';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useBooking } from '@/components/scheduling/hooks/useBooking';
import { EventSelector } from '@/components/scheduling/components/EventSelector';
import { CalendarPicker } from '@/components/scheduling/components/CalendarPicker';
import { TimeSlotGrid } from '@/components/scheduling/components/TimeSlotGrid';
import { BookingForm } from '@/components/scheduling/components/BookingForm';
import { ConfirmationView } from '@/components/scheduling/components/ConfirmationView';
import { getAllEventTypes } from '@/components/scheduling/config/eventTypes';
import { formatDateWithTimezone, getRequesterTimezone } from '@/components/scheduling/utils/timezone';
import type { DayAvailability } from '@/components/scheduling/types/booking';
import '@/styles/scheduling.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const SchedulePage = () => {
  usePageMeta({
    title: 'Grab Coffee | McCal Media',
    description: 'Schedule a coffee chat or project consultation with Caleb McCartney.',
    canonical: `${SITE_URL}/grab-coffee`,
    og: {
      type: 'website',
      title: 'Grab Coffee | McCal Media',
      description: 'Schedule a conversation with Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'Grab Coffee | McCal Media',
      description: 'Schedule a conversation with Caleb McCartney.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
  });

  const {
    state,
    selectEventType,
    selectDate,
    selectTime,
    submitBookingDetails,
    goBack,
    reset,
    availability,
    isLoadingAvailability,
    availabilityError,
  } = useBooking();

  const eventTypes = getAllEventTypes();
  const requesterTimezone = getRequesterTimezone();

  // Get selected day's slots
  const selectedDayAvailability: DayAvailability | undefined = state.selectedDate
    ? availability.find((d) => d.date === state.selectedDate)
    : undefined;

  // Format displays
  const dateDisplay = state.selectedDate
    ? formatDateWithTimezone(state.selectedDate, requesterTimezone, 'full')
    : '';

  const timeDisplay = state.selectedTime || '';

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [
      { id: 'selecting-event', label: 'Event' },
      { id: 'selecting-date', label: 'Date' },
      { id: 'selecting-time', label: 'Time' },
      { id: 'entering-details', label: 'Details' },
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
              className={`scheduling-step ${isActive ? 'active' : ''} ${
                isCompleted ? 'completed' : ''
              }`}
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

  // Render current step content
  const renderStepContent = () => {
    switch (state.step) {
      case 'selecting-event':
        return (
          <EventSelector
            events={eventTypes}
            selectedId={state.selectedEventType?.id || null}
            onSelect={selectEventType}
          />
        );

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
                <button
                  className="scheduling-btn-secondary"
                  onClick={() => window.location.reload()}
                >
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
            <button className="scheduling-back-btn" onClick={goBack}>
              ← Back to event types
            </button>
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
            onSubmit={submitBookingDetails}
            onBack={goBack}
            isLoading={state.isLoading}
            eventName={state.selectedEventType?.name || ''}
            dateDisplay={dateDisplay}
            timeDisplay={timeDisplay}
          />
        );

      case 'confirmed':
        return state.confirmedBooking && state.selectedEventType ? (
          <ConfirmationView
            booking={state.confirmedBooking}
            eventType={state.selectedEventType}
            requesterTimezone={requesterTimezone}
            onBookAnother={reset}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="scheduling-page">
        <div className="scheduling-container">
          <header className="scheduling-header">
            <h1 className="scheduling-title">Grab Coffee</h1>
            <p className="scheduling-subtitle">
              Let&apos;s connect. Choose a time that works for you.
            </p>
          </header>

          {state.step !== 'confirmed' && renderStepIndicator()}

          <div className="scheduling-content">
            {state.error && (
              <div className="scheduling-error-banner" role="alert">
                <p>{state.error}</p>
              </div>
            )}
            {renderStepContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SchedulePage;
