/**
 * Moduł do obsługi błędów HTTP
 * Zawiera funkcje do elegancko obsługiwania błędów z API
 */

// Typy błędów HTTP
export type HttpError = {
  status: number;
  message: string;
  code?: string;
  details?: any;
};

// Pomocnicze mapowanie kodów statusu HTTP na przyjazne komunikaty
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Nieprawidłowe żądanie. Sprawdź parametry i spróbuj ponownie.',
  401: 'Brak autoryzacji. Zaloguj się, aby kontynuować.',
  403: 'Brak dostępu do żądanego zasobu.',
  404: 'Nie znaleziono żądanego zasobu.',
  408: 'Upłynął limit czasu żądania. Spróbuj ponownie.',
  429: 'Zbyt wiele żądań. Poczekaj chwilę i spróbuj ponownie.',
  500: 'Wystąpił błąd serwera. Spróbuj ponownie później.',
  502: 'Błąd bramy sieciowej. Spróbuj ponownie później.',
  503: 'Usługa niedostępna. Spróbuj ponownie później.',
  504: 'Upłynął limit czasu bramy. Spróbuj ponownie później.'
};

/**
 * Obsługa błędów HTTP z przyjaznym komunikatem
 */
export function handleHttpError(error: any): HttpError {
  console.error('HTTP Error:', error);
  
  // Błąd z kodem statusu HTTP
  if (error.status || error.statusCode) {
    const status = error.status || error.statusCode;
    return {
      status,
      message: error.message || HTTP_ERROR_MESSAGES[status] || 'Wystąpił nieznany błąd HTTP',
      code: error.code,
      details: error.details
    };
  }
  
  // Błąd związany z brakiem połączenia sieciowego
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      status: 0,
      message: 'Brak połączenia z serwerem. Sprawdź połączenie internetowe.'
    };
  }

  // Błąd przerwania żądania
  if (error.name === 'AbortError') {
    return {
      status: 499, // Kod używany dla przerwanych żądań (niestandardowy)
      message: 'Żądanie zostało przerwane. Spróbuj ponownie.'
    };
  }

  // Domyślny przypadek dla nierozpoznanych błędów
  return {
    status: 500,
    message: error.message || 'Wystąpił nieoczekiwany błąd.',
    details: error
  };
}

/**
 * Sprawdza czy odpowiedź HTTP jest poprawna
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: HttpError = {
      status: response.status,
      message: HTTP_ERROR_MESSAGES[response.status] || `Error: ${response.statusText}`,
    };
    
    try {
      // Próba odczytania szczegółów błędu z odpowiedzi
      const errorData = await response.json();
      error.message = errorData.message || error.message;
      error.code = errorData.code;
      error.details = errorData.details || errorData;
    } catch (e) {
      // Jeśli nie udało się odczytać JSON, użyj statusText
      error.message = response.statusText || error.message;
    }
    
    throw error;
  }
  
  return await response.json() as T;
}
