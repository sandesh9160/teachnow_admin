"use client";

import { useState, useEffect, useCallback } from "react";

interface UseFetchOptions<T> {
  initialData?: T;
  immediate?: boolean;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Generic data fetching hook — ready for Phase 2 API integration.
 * Currently returns mock data; will be wired to admin.service.ts endpoints.
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
  const { initialData = null, immediate = true } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
