"use client"

import React from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { useWindowSize } from '@/hooks/useWindowSize';

interface VirtualListProps<T> {
  items: T[];
  height?: number;
  width?: number;
  itemSize?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

/**
 * Komponent renderujący duże listy w sposób zoptymalizowany
 * Używa techniki wirtualizacji, renderując tylko elementy aktualnie widoczne na ekranie
 * Znacząco poprawia wydajność przy długich listach
 */
export function VirtualList<T>({
  items,
  height = 400,
  width = '100%',
  itemSize = 50,
  renderItem,
  className
}: VirtualListProps<T>) {
  // Pobieramy rozmiar okna, aby dopasować szerokość listy
  const windowSize = useWindowSize();
  
  // Obliczamy ostateczną szerokość
  const finalWidth = typeof width === 'number' 
    ? width 
    : width === '100%' && windowSize.width 
      ? windowSize.width - 40 // odjęcie marginesów
      : 300; // domyślna wartość

  // Wewnętrzny komponent renderujący pojedynczy element listy
  const Row = ({ index, style }: ListChildComponentProps) => {
    return (
      <div style={style} className="px-2">
        {renderItem(items[index], index)}
      </div>
    );
  };

  return (
    <div className={className}>
      {items.length > 0 ? (
        <FixedSizeList
          height={height}
          width={finalWidth}
          itemCount={items.length}
          itemSize={itemSize}
        >
          {Row}
        </FixedSizeList>
      ) : (
        <div 
          className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded"
          style={{ height }}
        >
          Brak danych do wyświetlenia
        </div>
      )}
    </div>
  );
}
