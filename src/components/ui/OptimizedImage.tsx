"use client"

import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderColor?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Komponent dla zoptymalizowanego ładowania obrazów
 * Wspiera lazy loading i blur placeholder
 * 
 * @param src - URL obrazu
 * @param alt - Tekst alternatywny
 * @param width - Szerokość obrazu
 * @param height - Wysokość obrazu
 * @param className - Klasy CSS
 * @param placeholderColor - Kolor placeholdera
 * @param priority - Czy obraz ma priorytet ładowania
 * @param onLoad - Callback po załadowaniu
 * @param onError - Callback w przypadku błędu
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholderColor = '#f3f4f6',
  priority = false,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px', // Preload images 200px before they enter viewport
  });

  // Określenie wymiarów
  const style: React.CSSProperties = {
    backgroundColor: placeholderColor,
  };

  if (width) style.width = width;
  if (height) style.height = height;

  // Efekt załadowania obrazu
  useEffect(() => {
    if (isLoaded || !inView && !priority) return;
    
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setIsLoaded(true);
      onLoad?.();
    };
    
    img.onerror = () => {
      setIsError(true);
      onError?.();
    };
  }, [src, inView, priority, isLoaded, onLoad, onError]);

  return (
    <div 
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {(inView || priority) && (
        <>
          {isError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {alt || 'Błąd ładowania obrazu'}
              </span>
            </div>
          ) : (
            <img
              src={src}
              alt={alt}
              className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              width={width}
              height={height}
              loading={priority ? 'eager' : 'lazy'}
            />
          )}
        </>
      )}
    </div>
  );
};
