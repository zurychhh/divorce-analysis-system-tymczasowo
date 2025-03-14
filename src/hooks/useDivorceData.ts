import { useState, useEffect, useCallback } from 'react';

// Typy danych
interface DivorceDataPoint {
  year: string;
  [region: string]: number | string;
}

interface DivorceApiResponse {
  status: 'success' | 'error';
  data: Record<string, any>;
  metadata?: {
    years: number[];
    variableId: number;
    measureUnit: string;
    totalRegions: number;
  };
  message?: string;
}

type DataStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseDivorceDataReturn {
  data: DivorceDataPoint[] | null;
  status: DataStatus;
  error: string | null;
  refetch: () => Promise<void>;
}

// Cache dla danych
const dataCache: Record<string, {
  data: DivorceDataPoint[];
  timestamp: number;
}> = {};

// Czas ważności cache (15 minut)
const CACHE_TTL = 15 * 60 * 1000;

/**
 * Custom hook do pobierania danych o rozwodach dla wybranego regionu
 * 
 * @param region Nazwa województwa
 * @returns Obiekt z danymi, statusem, błędem i funkcją odświeżającą dane
 */
export function useDivorceData(region: string): UseDivorceDataReturn {
  const [data, setData] = useState<DivorceDataPoint[] | null>(null);
  const [status, setStatus] = useState<DataStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    if (!region) {
      setError('Nie wybrano województwa');
      return;
    }

    // Sprawdź czy mamy dane w cache i czy są aktualne
    const cacheKey = region.toLowerCase();
    const cachedData = dataCache[cacheKey];
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      console.log('Używam danych z cache dla regionu:', region);
      setData(cachedData.data);
      setStatus('success');
      return;
    }

    console.log(`Pobieranie danych dla regionu: ${region}`);
    setStatus('loading');
    setError(null);

    try {
      // Dodajemy parametry do zapytania
      const params = new URLSearchParams({
        region: region.toLowerCase(),
        years: '8' // ostatnie 8 lat
      });
      
      const response = await fetch(`/api/gus?${params}`);
      console.log('Status odpowiedzi API:', response.status);
      
      if (!response.ok) {
        throw new Error(`Błąd API: ${response.status}`);
      }

      const responseData: DivorceApiResponse = await response.json();
      console.log('Odpowiedź API:', responseData);

      if (responseData.status === 'success') {
        // Przygotowanie danych wykresu
        const chartData = (responseData.metadata?.years || [])
          .sort((a, b) => a - b)
          .map((year) => {
            const yearData: DivorceDataPoint = { year: year.toString() };

            // Znajdź dane dla wybranego regionu
            const normalizedRegion = region.toUpperCase();
            const regionData = Object.values(responseData.data || {})
              .find((r: any) => r.name?.toUpperCase() === normalizedRegion);

            if (regionData) {
              // Dodaj dane dla wybranego regionu
              yearData[regionData.name] = Number(regionData.values[year]) || 0;

              // Oblicz średnią krajową
              const allValues = Object.values(responseData.data)
                .map((r: any) => Number(r.values[year]) || 0)
                .filter(v => !isNaN(v));

              if (allValues.length > 0) {
                const average = Math.round(
                  allValues.reduce((a, b) => a + b, 0) / allValues.length
                );
                yearData['ŚREDNIA KRAJOWA'] = average;
              }
            }

            return yearData;
          });

        console.log('Przygotowane dane wykresu:', chartData);
        setData(chartData);
        setStatus('success');
        
        // Zapisz dane w cache
        dataCache[cacheKey] = { 
          data: chartData, 
          timestamp: Date.now() 
        };
      } else {
        throw new Error(responseData.message || 'Nieznany błąd API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
      console.error('Błąd pobierania danych:', errorMessage);
      setError(errorMessage);
      setStatus('error');
    }
  }, [region]);

  // Pobieranie danych przy pierwszym renderze lub zmianie regionu
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, status, error, refetch: fetchData };
}
