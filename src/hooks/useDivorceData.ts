// src/hooks/useDivorceData.ts.fix
import { useState, useEffect, useCallback } from 'react';
import { errorLogger } from '@/lib/errorLogger';

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
  useMock: boolean;
  refetch: () => Promise<void>;
}

/**
 * Custom hook do pobierania danych o rozwodach dla wybranego regionu
 * Zoptymalizowana wersja - priorytetyzuje dane produkcyjne
 * 
 * @param region Nazwa województwa
 * @returns Obiekt z danymi, statusem, błędem i funkcją odświeżającą dane
 */
export function useDivorceData(region: string): UseDivorceDataReturn {
  const [data, setData] = useState<DivorceDataPoint[] | null>(null);
  const [status, setStatus] = useState<DataStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState<boolean>(false);
  
  const fetchData = useCallback(async () => {
    if (!region) {
      setError('Nie wybrano województwa');
      return;
    }

    console.log(`Pobieranie produkcyjnych danych dla regionu: ${region}`);
    setStatus('loading');
    setError(null);
    setUseMock(false);

    try {
      // Dodajemy parametry do zapytania i logujemy dokładny URL
      const params = new URLSearchParams({
        region: region.toLowerCase(),
      });
      
      const url = `/api/gus?${params}`;
      console.log('Wykonuję zapytanie API:', url);
      
      const response = await fetch(url, {
        // Ustawiamy timeout i cache control
        headers: {
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
      });
      
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
              .find((r: any) => r.name?.toUpperCase().includes(normalizedRegion));

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
            } else {
              console.warn(`Nie znaleziono danych dla regionu ${normalizedRegion} w roku ${year}`);
            }

            return yearData;
          });

        console.log('Przygotowane dane wykresu:', chartData);
        
        if (chartData.length > 0 && Object.keys(chartData[0]).length > 1) {
          setData(chartData);
          setStatus('success');
          return;
        } else {
          console.warn("Otrzymano puste dane z API, mimo statusu success");
          throw new Error("Otrzymano puste dane z API");
        }
      } else {
        throw new Error(responseData.message || 'Nieznany błąd API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
      console.error('Błąd pobierania danych:', errorMessage);
      
      // Loguj błąd w systemie
      errorLogger.error(`Błąd pobierania danych dla regionu ${region}`, {
        error: errorMessage,
        region
      });
      
      setError(errorMessage);
      setStatus('error');
    }
  }, [region]);

  // Pobieranie danych przy pierwszym renderze lub zmianie regionu
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, status, error, useMock, refetch: fetchData };
}