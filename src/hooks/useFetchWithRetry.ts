import { useState, useCallback } from 'react';
import { handleHttpError, HttpError } from '@/lib/httpErrorHandler';

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: HttpError | null;
  status: 'idle' | 'loading' | 'success' | 'error';
}

interface FetchOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryStatusCodes?: number[];
  headers?: HeadersInit;
  timeout?: number;
  cache?: RequestCache;
}

/**
 * Hook do wykonywania zapytań HTTP z automatycznymi ponownymi próbami
 * 
 * @param initialUrl - Bazowy URL zapytania
 * @param defaultOptions - Domyślne opcje zapytania
 * @returns Stan zapytania i funkcje do jego wykonania
 */
export function useFetchWithRetry<T>(
  initialUrl?: string,
  defaultOptions: FetchOptions = {}
) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: false,
    error: null,
    status: 'idle'
  });

  /**
   * Funkcja wykonująca ponowną próbę zapytania z wykładniczym wycofaniem
   */
  const fetchWithRetry = useCallback(async (
    url: string,
    options: RequestInit & FetchOptions = {}
  ): Promise<T> => {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      retryStatusCodes = [408, 429, 500, 502, 503, 504],
      timeout = 10000,
      ...fetchOptions
    } = options;
    
    let retries = 0;
    
    // Tworzymy controller dla obsługi timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const executeRequest = async (): Promise<T> => {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
          signal: controller.signal
        });
        
        // Sprawdzamy czy odpowiedź wymaga ponowienia próby
        if (!response.ok && retryStatusCodes.includes(response.status) && retries < maxRetries) {
          retries++;
          const delay = retryDelay * Math.pow(2, retries - 1); // Wykładnicze wycofanie
          
          console.log(`Próba ${retries}/${maxRetries} nie powiodła się (status ${response.status}). Ponowienie za ${delay}ms...`);
          
          // Czekamy przed ponowieniem próby
          await new Promise(resolve => setTimeout(resolve, delay));
          return executeRequest();
        }
        
        // Jeśli status nie jest ok i nie kwalifikuje się do ponowienia,
        // lub przekroczyliśmy limit prób - przetwarzamy błąd
        if (!response.ok) {
          throw response;
        }
        
        // Parsujemy odpowiedź jako JSON
        return await response.json();
      } catch (error) {
        // Jeśli to timeout lub błąd sieci, i mamy jeszcze próby
        if (error instanceof Error && 
            (error.name === 'AbortError' || error.name === 'TypeError') && 
            retries < maxRetries) {
          retries++;
          const delay = retryDelay * Math.pow(2, retries - 1);
          
          console.log(`Próba ${retries}/${maxRetries} nie powiodła się (${error.name}). Ponowienie za ${delay}ms...`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return executeRequest();
        }
        
        throw error;
      }
    };
    
    try {
      const result = await executeRequest();
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }, []);

  /**
   * Główna funkcja wykonująca zapytanie
   */
  const fetchData = useCallback(async (
    url: string = initialUrl || '',
    options: RequestInit & FetchOptions = {}
  ) => {
    if (!url) {
      setState(prev => ({
        ...prev,
        error: { status: 400, message: 'URL nie został podany' },
        status: 'error'
      }));
      return;
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null, status: 'loading' }));
    
    try {
      const data = await fetchWithRetry<T>(url, { ...defaultOptions, ...options });
      
      setState({
        data,
        isLoading: false,
        error: null,
        status: 'success'
      });
      
      return data;
    } catch (error) {
      const httpError = handleHttpError(error);
      
      setState({
        data: null,
        isLoading: false,
        error: httpError,
        status: 'error'
      });
      
      return null;
    }
  }, [initialUrl, fetchWithRetry, defaultOptions]);

  /**
   * Funkcja resetująca stan
   */
  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      status: 'idle'
    });
  }, []);

  return {
    ...state,
    fetchData,
    reset
  };
}
