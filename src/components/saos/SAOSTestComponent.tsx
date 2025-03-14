"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

// Typy dla danych SAOS
interface JudgmentItem {
  id: number;
  courtCases: { caseNumber: string }[];
  judgmentDate: string;
  division: {
    court: {
      name: string;
    };
  };
}

interface SAOSResponse {
  items: JudgmentItem[];
  info?: {
    totalResults: number;
  };
}

type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

const SAOSTestComponent = () => {
  const [data, setData] = useState<SAOSResponse | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  /**
   * Pobiera dane o orzeczeniach rozwodowych z API SAOS
   */
  const fetchDivorceData = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      // Dodajemy timeout, aby uniknąć zawieszenia na długo oczekujących żądaniach
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 sekund timeout
      
      const response = await fetch(
        'https://www.saos.org.pl/api/search/judgments?' + 
        new URLSearchParams({
          pageSize: '10',
          sortingField: 'JUDGMENT_DATE',
          sortingDirection: 'DESC',
          all: 'rozwód',
          judgmentDateFrom: '2024-01-01',
          courtType: 'COMMON'
        }),
        { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Błąd sieci: ${response.status} ${response.statusText}`);
      }

      const jsonData = await response.json();
      setData(jsonData);
      setStatus('success');
      // Reset licznika ponownych prób po sukcesie
      setRetryCount(0);
    } catch (err) {
      console.error('Błąd pobierania danych:', err);
      
      // Szczegółowa informacja o błędzie
      let errorMessage = 'Wystąpił nieznany błąd';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Żądanie przerwane z powodu przekroczenia limitu czasu (15s)';
        } else {
          errorMessage = err.message || 'Wystąpił błąd';
        }
      }
      
      setError(errorMessage);
      setStatus('error');
    }
  }, []);

  /**
   * Ponawia żądanie z licznikiem prób
   */
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchDivorceData();
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            Test Połączenia z API SAOS
            {status === 'loading' && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={fetchDivorceData}
              disabled={status === 'loading'}
              className="w-full"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Pobieranie danych...
                </>
              ) : (
                'Pobierz Najnowsze Orzeczenia Rozwodowe'
              )}
            </Button>

            {status === 'error' && (
              <div className="p-4 mt-4 text-red-600 bg-red-50 rounded-md border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Błąd:</p>
                    <p>{error}</p>
                    {retryCount < 3 && (
                      <Button 
                        onClick={handleRetry} 
                        variant="outline" 
                        className="mt-2"
                        size="sm"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Ponów próbę ({retryCount + 1}/3)
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {status === 'success' && data && (
              <div className="space-y-4 mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Znaleziono łącznie: {data.info?.totalResults || 0} orzeczeń
                </p>
                
                <div className="space-y-2">
                  {data.items?.length === 0 && (
                    <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                      Brak wyników spełniających kryteria wyszukiwania
                    </p>
                  )}
                  
                  {data.items?.map((judgment) => (
                    <div key={judgment.id} className="p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <p className="font-medium">
                        Sygnatura: {judgment.courtCases?.[0]?.caseNumber || 'Brak danych'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Data: {judgment.judgmentDate || 'Brak danych'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sąd: {judgment.division?.court?.name || 'Brak danych'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SAOSTestComponent;
