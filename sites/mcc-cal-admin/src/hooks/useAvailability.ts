import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AvailabilityData, AvailabilityRule, BookingTypeId } from '@/lib/availability';

const API_BASE = '/api/admin';
const QUERY_KEY = ['availability'] as const;

async function readAvailability(): Promise<AvailabilityData> {
  const response = await fetch(`${API_BASE}/availability`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.ok) {
    // Surfaced verbatim in the editor, so keep it recognisable rather than generic.
    throw new Error(body?.error ?? `Failed to load availability (${response.status})`);
  }

  return body.data as AvailabilityData;
}

export function useAvailability() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: readAvailability,
    staleTime: 1000 * 60,
  });
}

/**
 * Saves a whole week for one booking type. The endpoint replaces every rule for
 * that type, so the caller sends the complete set rather than a diff.
 */
export function useSaveAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingType,
      rules,
    }: {
      bookingType: BookingTypeId;
      rules: AvailabilityRule[];
    }) => {
      const response = await fetch(`${API_BASE}/availability`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          bookingType,
          rules: rules.map(({ weekday, startMinute, endMinute, isActive }) => ({
            weekday,
            startMinute,
            endMinute,
            isActive,
          })),
        }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok || !body?.ok) {
        throw new Error(body?.error ?? `Failed to save availability (${response.status})`);
      }

      return body.data as AvailabilityData;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data);
    },
  });
}
