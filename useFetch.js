import { useState, useEffect } from "react";

/**
 * Custom hook for fetching data from a URL
 * @param {string} url - The URL to fetch data from
 * @param {object} options - Optional fetch options
 * @returns {{ data: any, loading: boolean, error: string | null }}
 */
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't fetch if no URL provided
    if (!url) return;

    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          ...options,
          signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Only update state if the component hasn't unmounted
        if (!signal.aborted) {
          setData(result);
        }
      } catch (err) {
        // Ignore abort errors
        if (err.name === "AbortError") {
          return;
        }
        if (!signal.aborted) {
          setError(err.message);
          setData(null);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function - abort fetch on unmount or URL change
    return () => {
      abortController.abort();
    };
  }, [url, options.method, options.headers]);

  return { data, loading, error };
}

export default useFetch;
