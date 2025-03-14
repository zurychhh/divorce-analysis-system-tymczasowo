"use client"
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePrefetch, usePrefetchOnly } from '@/hooks/usePrefetch';

/**
 * Przykładowy komponent demonstrujący użycie prefetchingu danych
 */
export const PrefetchExample: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('dolnośląskie');
  const [showDetails, setShowDetails] = useState(false);

  // Prefetchuj dane dla podstawowego widoku
  const { data, isLoading, error, refetch } = usePrefetch(
    `/api/gus?region=${selectedRegion}`,
    {
      expiration: 10 * 60 * 1000, // 10 minut
      transform: (data) => ({
        ...data,
        processedAt: new Date().toISOString(),
      }),
    }
  );

  // Prefetchuj dane dla szczegółowego widoku, który może być potrzebny później
  usePrefetchOnly(
    [
      `/api/gus/details?region=${selectedRegion}`,
      `/api/courts?region=${selectedRegion}`,
    ],
    {
      // Prefetchuj tylko jeśli użytkownik wypełnił już podstawowe informacje
      enabled: data !== null,
    }
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Analiza Rozwodowa: {selectedRegion}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['dolnośląskie', 'mazowieckie', 'małopolskie'].map((region) => (
              <Button
                key={region}
                variant={region === selectedRegion ? 'default' : 'outline'}
                onClick={() => setSelectedRegion(region)}
              >
                {region}
              </Button>
            ))}
          </div>

          {isLoading && <p>Ładowanie danych...</p>}

          {error && (
            <div className="p-4 border border-red-300 bg-red-50 text-red-600 rounded">
              Błąd: {error.message}
            </div>
          )}

          {data && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Podstawowe dane</h3>
              <p className="text-sm text-gray-500">
                Dane zostały przetworzone: {data.processedAt}
              </p>

              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Ukryj szczegóły' : 'Pokaż szczegóły'}
                </Button>
              </div>

              {showDetails && (
                <div className="mt-4 p-4 border rounded">
                  <h4 className="font-medium mb-2">Szczegółowe dane</h4>
                  <p>
                    Te dane zostały prawdopodobnie wstępnie pobrane, więc pojawiają się
                    natychmiast bez opóźnienia!
                  </p>
                </div>
              )}

              <div className="mt-4">
                <Button onClick={() => refetch()}>Odśwież dane</Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};