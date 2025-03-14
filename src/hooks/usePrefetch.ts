import { useState, useEffect, useCallback } from 'react';
import { prefetchData, fetchWithPrefetch, isDataPrefetched } from '@/lib/prefetch';

/**
 * Hook do wygodnego korzystania z mechanizmu prefetchingu w komponentach React
 * 
 * @param url - Adres URL do pobrania danych
 * @param options - Opcje pobierania i prefetchingu
 * @returns Obiekt zawierający dane i stan pobierania
 */
export function usePrefetch<T = any>(
  url: string | null,
  options: {
    prefetch?: boolean;  // Czy prefetchować dane przy mountowaniu
    expiration?: number;  // Czas wygaśnięcia cache w ms
    dependencies?: any[];  // Zależności, przy zmianie których ponownie pobieramy dane
    transform?: (data: any) => T;  // Funkcja transformująca dane
    skip?: boolean;  // Czy pominąć automatyczne pobieranie
    onSuccess?: (data: T) => void;  // Callback po udanym pobraniu
    onError?: (error: Error) => void;  // Callback po błędzie
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Domyślne wartości opcji
  const {
    prefetch = true,
    expiration,
    dependencies = [],
    transform,
    skip = false,
    onSuccess,
    onError
  } = options;

  // Funkcja do pobierania danych
  const fetchData = useCallback(async (forceRefresh: boolean = false) => {
    if (!url || skip) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Używamy funkcji fetchWithPrefetch, która sprawdzi cache
      const result = await fetchWithPrefetch<T>(url, {
        expiration,
        transform,
        forceRefresh
      });

      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Nieznany błąd podczas pobierania danych');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [url, skip, expiration, transform, onSuccess, onError]);

  // Funkcja do wstępnego pobierania danych
  const prefetchUrl = useCallback(async () => {
    if (!url || skip || !prefetch) {
      return;
    }

    // Jeśli dane już są prefetchowane, nie robimy nic
    if (isDataPrefetched(url)) {
      return;
    }

    // Prefetchuj dane
    await prefetchData(url, {
      expiration,
      transform,
      skip: false
    });
  }, [url, skip, prefetch, expiration, transform]);

  // Efekt do prefetchowania przy montowaniu
  useEffect(() => {
    prefetchUrl();
  }, [prefetchUrl]);

  // Efekt do pobierania danych przy zmianie URL lub zależności
  useEffect(() => {
    fetchData(false);
  }, [fetchData, url, ...dependencies]);

  // Funkcja do wymuszenia odświeżenia danych
  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
    prefetch: prefetchUrl
  };
}

/**
 * Hook do prefetchowania danych bez ich faktycznego użycia
 * Przydatny do prefetchowania danych dla następnego kroku przepływu użytkownika
 * 
 * @param urls - Tablica adresów URL do prefetchowania
 * @param options - Opcje prefetchingu
 */
export function usePrefetchOnly(
  urls: string[],
  options: {
    expiration?: number;
    transform?: (data: any) => any;
    enabled?: boolean;  // Czy prefetching jest włączony
  } = {}
) {
  const { enabled = true, expiration, transform } = options;

  // Prefetchuj dane przy montowaniu
  useEffect(() => {
    if (!enabled || !urls.length) {
      return;
    }

    // Prefetchuj wszystkie URL-e
    Promise.all(
      urls.map(url => prefetchData(url, { expiration, transform }))
    ).catch(err => {
      console.warn('Błąd podczas prefetchowania danych:', err);
    });
  }, [urls, enabled, expiration, transform]);
}