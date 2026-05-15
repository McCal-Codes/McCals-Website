import { useCallback, useEffect, useRef, useState } from 'react';

interface UsePageDataOptions {
  simulateLoading?: boolean;
  loadingDelay?: number;
}

interface UsePageDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePageData<T>(
  dataFetcher: () => Promise<T> | T,
  options: UsePageDataOptions = {}
): UsePageDataResult<T> {
  const { simulateLoading = false, loadingDelay = 500 } = options;
  const requestIdRef = useRef(0);
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      setLoading(true);
      setError(null);
      
      // Simulate loading delay if requested
      if (simulateLoading) {
        await new Promise(resolve => setTimeout(resolve, loadingDelay));
      }
      
      const result = await dataFetcher();
      if (requestId !== requestIdRef.current) return;

      setData(result);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      setError(err instanceof Error ? err.message : 'An error occurred while loading data');
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [dataFetcher, loadingDelay, simulateLoading]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchData().catch(() => undefined);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      requestIdRef.current += 1;
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
