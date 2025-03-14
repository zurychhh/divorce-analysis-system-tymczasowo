/**
 * Narzędzia do mierzenia wydajności aplikacji
 * Umożliwia śledzenie czasu wykonania różnych operacji
 */

// Funkcja rozpoczynająca pomiar
export function startMeasure(label: string): void {
  if (typeof performance !== 'undefined' && process.env.NODE_ENV === 'development') {
    performance.mark(`${label}-start`);
  }
}

// Funkcja kończąca pomiar i logująca wynik
export function endMeasure(label: string): void {
  if (typeof performance !== 'undefined' && process.env.NODE_ENV === 'development') {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measures = performance.getEntriesByName(label, 'measure');
    if (measures.length > 0) {
      console.log(`⏱️ ${label}: ${measures[0].duration.toFixed(2)}ms`);
    }
    
    // Wyczyść markery i pomiary
    performance.clearMarks(`${label}-start`);
    performance.clearMarks(`${label}-end`);
    performance.clearMeasures(label);
  }
}
