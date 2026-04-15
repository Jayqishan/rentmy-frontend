import { useCallback, useEffect, useState } from "react";

export default function useFetch(url, options = {}) {
  const { immediate = true, ...requestOptions } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const refetch = useCallback(async (overrideUrl = url, overrideOptions = {}) => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(overrideUrl, {
        ...requestOptions,
        ...overrideOptions,
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, requestOptions]);

  useEffect(() => {
    if (!immediate || !url) {
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(null);

    fetch(url, { ...requestOptions, signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        return response.json();
      })
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active && err.name !== "AbortError") setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [url, immediate, requestOptions]);

  return { data, loading, error, refetch };
}
