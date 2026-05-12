import { useState, useEffect } from 'react';

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
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate loading delay if requested
      if (simulateLoading) {
        await new Promise(resolve => setTimeout(resolve, loadingDelay));
      }
      
      const result = await dataFetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
