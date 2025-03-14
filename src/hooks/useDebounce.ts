import { useState, useEffect } from 'react';

/**
 * Hook zapewniający opóźnienie aktualizacji wartości
 * Przydatny do zapobiegania zbyt częstym zapytaniom API
 * gdy użytkownik szybko zmienia input
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
