import { NextRequest, NextResponse } from 'next/server';

// Maksymalna liczba prób pobrania danych
const MAX_RETRIES = 3;

// Funkcja pomocnicza do opóźnienia wykonania
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Funkcja do pobierania danych z API GUS z obsługą ponownych prób
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries <= 1) throw error;
    
    // Wykładnicze opóźnienie przed następną próbą
    const backoff = Math.min(1000 * (2 ** (MAX_RETRIES - retries)), 10000);
    console.log(`Retry attempt ${MAX_RETRIES - retries + 1} for ${url} after ${backoff}ms`);
    await delay(backoff);
    
    return fetchWithRetry(url, options, retries - 1);
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get('region')?.trim() || '';
  const yearCount = Math.min(
    Math.max(parseInt(searchParams.get('years') || '8', 10), 1), 
    15
  ); // Min 1, max 15 lat
  const fromYear = parseInt(searchParams.get('fromYear') || '0', 10);
  const toYear = parseInt(searchParams.get('toYear') || '0', 10);
  
  // Oblicz lata, dla których chcemy pobrać dane
  let YEARS: number[] = [];
  const currentYear = new Date().getFullYear();

  if (fromYear > 0 && toYear > 0 && fromYear <= toYear) {
    // Użyj określonego zakresu lat
    YEARS = Array.from(
      { length: toYear - fromYear + 1 }, 
      (_, i) => fromYear + i
    );
  } else {
    // Użyj domyślnego zakresu
    YEARS = Array.from(
      { length: yearCount }, 
      (_, i) => currentYear - yearCount + i + 1
    );
  }

  // Ogranicz do dostępnego zakresu (zakładamy że dane GUS są od 2000 roku)
  YEARS = YEARS.filter(year => year >= 2000 && year <= currentYear);
  
  const API_URL = "https://bdl.stat.gov.pl/api/v1";
  const VARIABLE_ID = 6; // ID zmiennej dla rozwodów w GUS
  
  try {
    console.log(`Pobieranie danych dla lat: ${YEARS.join(', ')}`);
    console.log(`Wybrany region: ${region || 'wszystkie'}`);
    
    // Ograniczenie liczby jednoczesnych zapytań
    const batchSize = 3;
    const processedData = {};
    
    // Przetwarzanie lat w partiach
    for (let i = 0; i < YEARS.length; i += batchSize) {
      const batchYears = YEARS.slice(i, i + batchSize);
      console.log(`Przetwarzanie partii dla lat: ${batchYears.join(', ')}`);
      
      const batchPromises = batchYears.map(async year => {
        const url = `${API_URL}/data/By-Variable/${VARIABLE_ID}?year=${year}&unit-level=2&page-size=20&format=json`;
        const response = await fetchWithRetry(url);
        const data = await response.json();
        return { year, data };
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Agregacja wyników
      batchResults.forEach(({year, data}) => {
        data.results.forEach(result => {
          if (!processedData[result.id]) {
            processedData[result.id] = {
              name: result.name,
              values: {}
            };
          }
          const value = result.values?.[0]?.val;
          processedData[result.id].values[year] = value || 0;
        });
      });
      
      // Krótkie opóźnienie między partiami aby uniknąć throttlingu API
      if (i + batchSize < YEARS.length) {
        await delay(300);
      }
    }

    // Filtrowanie danych według regionu, jeśli podano
    let finalData = processedData;
    if (region) {
      const normalizedRegion = region.toUpperCase();
      const filteredData = {};
      
      // Znajdź pasujące regiony (może być kilka, jeśli nazwa jest częściowa)
      Object.entries(processedData).forEach(([id, data]) => {
        const regionName = (data as any).name.toUpperCase();
        if (regionName.includes(normalizedRegion)) {
          filteredData[id] = data;
        }
      });
      
      // Jeśli znaleziono pasujące regiony, użyj ich
      if (Object.keys(filteredData).length > 0) {
        finalData = filteredData;
      }
      
      console.log(`Znaleziono ${Object.keys(finalData).length} regionów pasujących do zapytania`);
    }

    return NextResponse.json({
      status: "success",
      data: finalData,
      metadata: {
        years: YEARS,
        variableId: VARIABLE_ID,
        measureUnit: "osoba",
        totalRegions: Object.keys(finalData).length,
        filteredByRegion: !!region
      }
    });
  } catch (error) {
    console.error("Error fetching GUS data:", error);
    
    // Szczegółowa informacja o błędzie
    return NextResponse.json({ 
      status: "error", 
      message: error instanceof Error ? error.message : "Nieznany błąd",
      error: {
        name: error instanceof Error ? error.name : "Unknown",
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : null
      }
    }, { status: 500 });
  }
}
