"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Komponent do obsługi błędów w aplikacji
 * Przechwytuje błędy w drzewie komponentów i wyświetla fallback UI
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Wystąpił błąd:", error, errorInfo);
    
    // Tutaj można dodać wysyłanie błędów do serwisu monitorującego
    // np. Sentry, LogRocket, itp.
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      // Domyślny UI dla błędu
      const defaultFallback = (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-md p-8 space-y-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                Coś poszło nie tak
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Przepraszamy, wystąpił nieoczekiwany błąd.
              </p>
              {this.state.error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm rounded">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="flex justify-center mt-6">
              <Button
                onClick={this.resetError}
                variant="default"
              >
                Spróbuj ponownie
              </Button>
            </div>
          </div>
        </div>
      );
      
      return this.props.fallback || defaultFallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
