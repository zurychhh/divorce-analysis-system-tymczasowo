"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SAOSTestComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDivorceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        'https://www.saos.org.pl/api/search/judgments?' + 
        new URLSearchParams({
          pageSize: '10',
          sortingField: 'JUDGMENT_DATE',
          sortingDirection: 'DESC',
          all: 'rozwód',
          judgmentDateFrom: '2024-01-01',
          courtType: 'COMMON'
        })
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Połączenia z API SAOS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={fetchDivorceData}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Pobieranie danych...' : 'Pobierz Najnowsze Orzeczenia Rozwodowe'}
            </Button>

            {error && (
              <div className="p-4 mt-4 text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            {data && (
              <div className="space-y-4 mt-4">
                <p className="text-sm text-gray-500">
                  Znaleziono łącznie: {data.info?.totalResults || 0} orzeczeń
                </p>
                
                <div className="space-y-2">
                  {data.items?.map((judgment, index) => (
                    <div key={judgment.id} className="p-4 border rounded-lg">
                      <p className="font-medium">
                        Sygnatura: {judgment.courtCases?.[0]?.caseNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        Data: {judgment.judgmentDate}
                      </p>
                      <p className="text-sm text-gray-600">
                        Sąd: {judgment.division?.court?.name}
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
