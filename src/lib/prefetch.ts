/**
 * Moduł do wstępnego pobierania danych, które prawdopodobnie będą potrzebne użytkownikowi
 * Poprawia postrzeganie wydajności aplikacji i płynność przejść między widokami
 */

// Pamięć podręczna dla prefetchowanych zasobów
const prefetchCache: Map<string, {
    data: any;
    timestamp: number;
    expiresAt: number;
  }> = new Map();
  
  // Domyślny czas wygaśnięcia (5 minut)
  const DEFAULT_EXPIRATION = 5 * 60 * 1000;
  
  /**
   * Prefetchuje dane z podanego URL i zapisuje w pamięci podręcznej
   * 
   * @param url - Adres URL do prefetchowania
   * @param options - Opcje prefetchowania
   * @returns Promise z pobranymi danymi
   */
  export async function prefetchData<T>(
    url: string, 
    options: {
      expiration?: number;  // Czas wygaśnięcia w ms
      headers?: HeadersInit;
      transform?: (data: any) => T;  // Funkcja do transformacji danych
      skip?: boolean;  // Flaga do pominięcia prefetchingu (np. podczas testów)
    } = {}
  ): Promise<T | null> {
    // Jeśli ustawiono flagę skip, pomiń prefetching
    if (options.skip) {
      return null;
    }
  
    const expiration = options.expiration || DEFAULT_EXPIRATION;
    const cacheKey = url;
    
    // Sprawdź czy mamy już te dane w pamięci podręcznej i czy są nadal aktualne
    const cached = prefetchCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && cached.expiresAt > now) {
      console.log(`[Prefetch] Używam danych z pamięci podręcznej dla: ${url}`);
      return options.transform ? options.transform(cached.data) : cached.data;
    }
  
    try {
      console.log(`[Prefetch] Wstępne pobieranie danych z: ${url}`);
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        // Informujemy serwer, że to prefetching (serwer może zareagować inaczej)
        priority: 'low',
      });
  
      if (!response.ok) {
        throw new Error(`Błąd prefetchingu (${response.status}): ${response.statusText}`);
      }
  
      const data = await response.json();
      const transformedData = options.transform ? options.transform(data) : data;
      
      // Zapisz w pamięci podręcznej
      prefetchCache.set(cacheKey, {
        data: transformedData,
        timestamp: now,
        expiresAt: now + expiration,
      });
  
      return transformedData;
    } catch (error) {
      console.warn(`[Prefetch] Błąd pobierania danych z ${url}:`, error);
      return null;
    }
  }
  
  /**
   * Pobiera dane z pamięci podręcznej lub z API, jeśli nie są dostępne
   * 
   * @param url - Adres URL do pobrania
   * @param options - Opcje pobierania
   * @returns Promise z pobranymi danymi
   */
  export async function fetchWithPrefetch<T>(
    url: string,
    options: {
      expiration?: number;
      headers?: HeadersInit;
      transform?: (data: any) => T;
      forceRefresh?: boolean;  // Wymusza pobranie świeżych danych
    } = {}
  ): Promise<T> {
    const cacheKey = url;
    const cached = prefetchCache.get(cacheKey);
    const now = Date.now();
    
    // Jeśli mamy aktualne dane w cache i nie wymuszono odświeżenia, użyj ich
    if (cached && cached.expiresAt > now && !options.forceRefresh) {
      console.log(`[Fetch] Używam prefetchowanych danych dla: ${url}`);
      return options.transform ? options.transform(cached.data) : cached.data;
    }
    
    try {
      console.log(`[Fetch] Pobieranie danych z: ${url}`);
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Błąd pobierania (${response.status}): ${response.statusText}`);
      }
  
      const data = await response.json();
      const transformedData = options.transform ? options.transform(data) : data;
      
      // Zaktualizuj pamięć podręczną
      const expiration = options.expiration || DEFAULT_EXPIRATION;
      prefetchCache.set(cacheKey, {
        data: transformedData,
        timestamp: now,
        expiresAt: now + expiration,
      });
  
      return transformedData;
    } catch (error) {
      console.error(`[Fetch] Błąd pobierania danych z ${url}:`, error);
      throw error;
    }
  }
  
  /**
   * Sprawdza czy dane dla danego URL są w pamięci podręcznej i aktualne
   * 
   * @param url - Adres URL do sprawdzenia
   * @returns Czy dane są w pamięci podręcznej i aktualne
   */
  export function isDataPrefetched(url: string): boolean {
    const cached = prefetchCache.get(url);
    return cached !== undefined && cached.expiresAt > Date.now();
  }
  
  /**
   * Czyści pamięć podręczną prefetchingu
   * 
   * @param url - Opcjonalny URL do wyczyszczenia (jeśli nie podano, czyści całą pamięć)
   */
  export function clearPrefetchCache(url?: string): void {
    if (url) {
      prefetchCache.delete(url);
    } else {
      prefetchCache.clear();
    }
  }
  
  /**
   * Prefetchuje dane dla następnej strony na podstawie obecnej
   * Przydatne przy nawigacji user flow
   * 
   * @param currentPage - Obecna strona/krok
   * @param flowSteps - Opis przepływu (na której stronie jakie dane pobrać)
   */
  export async function prefetchNextPageData(
    currentPage: string,
    flowSteps: Record<string, string[]>
  ): Promise<void> {
    const nextStepUrls = flowSteps[currentPage];
    
    if (!nextStepUrls || nextStepUrls.length === 0) {
      return;
    }
    
    // Prefetchuj wszystkie URL-e dla następnego kroku
    await Promise.all(
      nextStepUrls.map(url => prefetchData(url))
    );
  }