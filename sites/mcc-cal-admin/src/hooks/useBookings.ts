import { useQuery } from '@tanstack/react-query';
import type { 
  Booking, 
  BookingWithDerived, 
  BookingsResponse, 
  BookingDetailResponse,
  BookingsFilter,
  PaginationInfo,
  BookingSummary 
} from '@/lib/bookings';

const API_BASE = '/api/admin';

// Query keys for caching
export const bookingsKeys = {
  all: ['bookings'] as const,
  list: (filters: BookingsFilter, pagination: { page: number; limit: number }) => 
    [...bookingsKeys.all, 'list', filters, pagination] as const,
  detail: (id: string) => [...bookingsKeys.all, 'detail', id] as const,
};

interface UseBookingsOptions {
  page?: number;
  limit?: number;
  filters?: BookingsFilter;
}

interface UseBookingsReturn {
  bookings: Booking[];
  pagination: PaginationInfo | null;
  summary: BookingSummary | null;
  filters: BookingsFilter;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBookings(options: UseBookingsOptions = {}): UseBookingsReturn {
  const { page = 1, limit = 20, filters = {} } = options;

  const query = useQuery<BookingsResponse>({
    queryKey: bookingsKeys.list(filters, { page, limit }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      
      if (filters.startDate) params.set('start', filters.startDate);
      if (filters.endDate) params.set('end', filters.endDate);
      if (filters.status) params.set('status', filters.status);
      if (filters.eventType) params.set('eventType', filters.eventType);
      if (filters.email) params.set('email', filters.email);

      const response = await fetch(`${API_BASE}/bookings?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('text/html')) {
          throw new Error(
            'API not available in Vite dev mode. Use "vercel dev" for full API support, or the API routes only exist in production.'
          );
        }
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to load bookings: ${response.status}`);
      }

      // Check if we got HTML instead of JSON (Vite SPA fallback)
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        throw new Error(
          'API returned HTML instead of JSON. The /api/admin/bookings endpoint requires Vercel runtime. Use "npm run dev:vercel" or deploy to test.'
        );
      }

      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    bookings: query.data?.data ?? [],
    pagination: query.data?.pagination ?? null,
    summary: query.data?.summary ?? null,
    filters: query.data?.filters?.applied ?? filters,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

interface UseBookingReturn {
  booking: BookingWithDerived | null;
  related: {
    sameRequester: Booking[];
    sameDate: Booking[];
  };
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBooking(id: string | null): UseBookingReturn {
  const query = useQuery<BookingDetailResponse>({
    queryKey: bookingsKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('Booking ID is required');
      
      const response = await fetch(`${API_BASE}/bookings/${id}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('text/html')) {
          throw new Error(
            'API not available in Vite dev mode. Use "vercel dev" for full API support.'
          );
        }
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to load booking: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        throw new Error(
          'API returned HTML instead of JSON. Use "npm run dev:vercel" to test API routes.'
        );
      }

      return response.json();
    },
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });

  return {
    booking: query.data?.data ?? null,
    related: query.data?.related ?? { sameRequester: [], sameDate: [] },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
