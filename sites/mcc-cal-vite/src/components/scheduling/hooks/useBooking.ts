import { useState, useCallback, useEffect } from 'react';
import type {
  BookingState,
  BookingStep,
  DayAvailability,
  RequesterInfo,
} from '../types/booking';
import { getBookingTypeById } from '../config/bookingTypes';
import { getRequesterTimezone, OWNER_TIMEZONE } from '../utils/timezone';
import type { Booking } from '../types/booking';
import { formatDateForInput, addDays } from '../utils/dateHelpers';

interface UseBookingReturn {
  state: BookingState;
  selectDate: (date: string) => void;
  selectTime: (time: string) => void;
  submitBookingDetails: (info: RequesterInfo, hpField?: string) => Promise<void>;
  goBack: () => void;
  reset: () => void;
  availability: DayAvailability[];
  isLoadingAvailability: boolean;
  availabilityError: string | null;
}

const getInitialState = (eventTypeId: string): BookingState => ({
  step: 'selecting-date', // Skip event selection, start at date
  selectedEventType: getBookingTypeById(eventTypeId) || null,
  selectedDate: null,
  selectedTime: null,
  requesterInfo: null,
  confirmedBooking: null,
  isLoading: false,
  error: null,
});

export function useBooking(eventTypeId: string): UseBookingReturn {
  const [state, setState] = useState<BookingState>(getInitialState(eventTypeId));
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // `getInitialState` resolves the event type back to the same module-level
  // object from BOOKING_TYPES, so after reset() the effect below sees an
  // unchanged dependency and never refetches. This counter gives it something
  // that actually changes, so "book another" repopulates the calendar.
  const [reloadKey, setReloadKey] = useState(0);

  // Fetch availability when event type is selected
  useEffect(() => {
    if (!state.selectedEventType) {
      setAvailability([]);
      return;
    }

    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      setAvailabilityError(null);

      try {
        // Calculate date range (current month +/- 1 month for buffer)
        const today = new Date();
        const startDate = formatDateForInput(today);
        const endDate = formatDateForInput(addDays(today, 60));

        // Use availability endpoint
        const response = await fetch(
          `/api/schedule/availability?eventType=${state.selectedEventType!.id}&start=${startDate}&end=${endDate}`,
          { headers: { Accept: 'application/json' } }
        );

        if (!response.ok) {
          throw new Error('Failed to load availability');
        }

        const data = await response.json();
        setAvailability(data.days || []);
      } catch (err) {
        setAvailabilityError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [state.selectedEventType, reloadKey]);

  const selectDate = useCallback((date: string) => {
    setState((prev) => ({
      ...prev,
      step: 'selecting-time',
      selectedDate: date,
      selectedTime: null,
      error: null,
    }));
  }, []);

  const selectTime = useCallback((time: string) => {
    setState((prev) => ({
      ...prev,
      step: 'entering-details',
      selectedTime: time,
      error: null,
    }));
  }, []);

  const submitBookingDetails = useCallback(async (info: RequesterInfo, hpField = '') => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const requesterTimezone = getRequesterTimezone();
      
      const response = await fetch('/api/schedule/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          eventTypeId: state.selectedEventType!.id,
          date: state.selectedDate,
          time: state.selectedTime,
          durationMinutes: state.selectedEventType!.durationMinutes,
          requester: info,
          requesterTimezone,
          // Honeypot. The server drops the request when this is non-empty, so
          // the name has to match what it reads (`hp_field`) — the form used to
          // call it `website` and never sent it, leaving nothing to check.
          hp_field: hpField,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // The API returns only what the calendar owns — id, start, end and
      // eventLink — while `Booking` (and ConfirmationView) also need the date,
      // time and requester. Reading those straight off `data.booking` left
      // `requester` undefined, so the confirmation screen threw on
      // `booking.requester.notes` and every successful booking ended in the
      // error boundary. Compose it from the state we already hold instead.
      const confirmedBooking: Booking = {
        id: data.booking?.id ?? '',
        eventTypeId: state.selectedEventType!.id,
        date: state.selectedDate!,
        time: state.selectedTime!,
        durationMinutes: state.selectedEventType!.durationMinutes,
        requester: info,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        requesterTimezone,
        ownerTimezone: OWNER_TIMEZONE,
      };

      setState((prev) => ({
        ...prev,
        step: 'confirmed',
        confirmedBooking,
        isLoading: false,
        requesterInfo: info,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to create booking',
      }));
    }
  }, [state.selectedEventType, state.selectedDate, state.selectedTime]);

  const goBack = useCallback(() => {
    setState((prev) => {
      const stepOrder: BookingStep[] = [
        'selecting-date',
        'selecting-time',
        'entering-details',
        'confirmed',
      ];
      const currentIndex = stepOrder.indexOf(prev.step);
      const previousStep = stepOrder[Math.max(0, currentIndex - 1)];

      return {
        ...prev,
        step: previousStep,
        // Clear selections when going back
        ...(previousStep === 'selecting-date' && { selectedDate: null }),
        ...(previousStep === 'selecting-time' && { selectedTime: null }),
        error: null,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState(getInitialState(eventTypeId));
    setAvailability([]);
    setAvailabilityError(null);
    setReloadKey((key) => key + 1);
  }, [eventTypeId]);

  return {
    state,
    selectDate,
    selectTime,
    submitBookingDetails,
    goBack,
    reset,
    availability,
    isLoadingAvailability,
    availabilityError,
  };
}
