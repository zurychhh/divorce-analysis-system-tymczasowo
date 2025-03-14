import { useState, useEffect } from 'react';

interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

/**
 * Hook do śledzenia rozmiaru okna przeglądarki
 * Przydatny do responsywnych komponentów i dostosowywania UI do dostępnej przestrzeni
 */
export function useWindowSize(): WindowSize {
  // Wartość początkowa undefined aby uniknąć problemów z SSR
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler do aktualizacji stanu z aktualnym rozmiarem okna
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Sprawdzenie, czy jesteśmy w przeglądarce (nie SSR)
    if (typeof window !== 'undefined') {
      // Dodanie nasłuchiwania na zmianę rozmiaru
      window.addEventListener('resize', handleResize);
      
      // Wywołanie handlera na starcie, aby ustawić początkowy rozmiar
      handleResize();
      
      // Usunięcie nasłuchiwania przy odmontowaniu komponentu
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return windowSize;
}
