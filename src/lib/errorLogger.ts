/**
 * Moduł do zaawansowanego logowania błędów
 * Zapewnia ujednolicone zbieranie, formatowanie i raportowanie błędów w aplikacji
 */

// Poziomy logowania
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Struktura błędu
export interface ErrorLog {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  stack?: string;
  componentStack?: string;
  userInfo?: {
    sessionId?: string;
    region?: string;
    currentUrl?: string;
    lastAction?: string;
  };
}

// Konfiguracja loggera
interface LoggerConfig {
  minLevel: LogLevel;
  captureConsoleErrors: boolean;
  captureUnhandledRejections: boolean;
  maxLogsStored: number;
  shouldSendToServer: boolean;
  serverUrl?: string;
  groupSimilarErrors: boolean;
  addUserContext: boolean;
}

// Domyślna konfiguracja
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.ERROR,
  captureConsoleErrors: true,
  captureUnhandledRejections: true,
  maxLogsStored: 50,
  shouldSendToServer: false,
  groupSimilarErrors: true,
  addUserContext: true,
};

/**
 * Główna klasa do logowania błędów
 */
class ErrorLogger {
  private config: LoggerConfig;
  private logs: ErrorLog[] = [];
  private originalConsoleError: typeof console.error;
  private isInitialized = false;
  private errorGroups: Map<string, number> = new Map();
  private sessionId: string;

  constructor(customConfig: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
    this.originalConsoleError = console.error;
    this.sessionId = this.generateSessionId();
  }

  /**
   * Inicjalizuje logger i ustawia przechwytywanie błędów
   */
  public init(): void {
    if (this.isInitialized) return;

    // Przechwytuj błędy konsoli
    if (this.config.captureConsoleErrors && typeof window !== 'undefined') {
      console.error = (...args: any[]) => {
        this.originalConsoleError(...args);
        const errorMessage = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        this.log(LogLevel.ERROR, errorMessage);
      };
    }

    // Przechwytuj nieobsłużone odrzucenia Promise
    if (this.config.captureUnhandledRejections && typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.log(
          LogLevel.ERROR, 
          `Unhandled Promise Rejection: ${event.reason}`,
          { reason: event.reason }
        );
      });

      // Przechwytuj niezłapane błędy
      window.addEventListener('error', (event) => {
        this.log(
          LogLevel.ERROR,
          `Uncaught Error: ${event.message}`,
          { 
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
          }
        );
        return false;
      });
    }

    this.isInitialized = true;
    this.debug('ErrorLogger zainicjalizowany');
  }

  /**
   * Generuje unikalny identyfikator sesji
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Loguje wiadomość na poziomie DEBUG
   */
  public debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Loguje wiadomość na poziomie INFO
   */
  public info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Loguje wiadomość na poziomie WARN
   */
  public warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Loguje wiadomość na poziomie ERROR
   */
  public error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Loguje wiadomość na poziomie CRITICAL
   */
  public critical(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.CRITICAL, message, context);
    // Krytyczne błędy zawsze wysyłamy na serwer, jeśli to skonfigurowano
    if (this.config.shouldSendToServer && this.config.serverUrl) {
      this.sendToServer({
        level: LogLevel.CRITICAL,
        message,
        context,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Główna funkcja logująca
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    // Sprawdź czy poziom logowania jest wystarczający
    if (!this.shouldLog(level)) return;

    // Utwórz wpis logu
    const errorId = this.generateErrorId(message);
    const stack = new Error().stack;
    
    const errorLog: ErrorLog = {
      id: errorId,
      timestamp: Date.now(),
      level,
      message,
      context,
      stack,
      userInfo: this.config.addUserContext ? this.getUserContext() : undefined
    };

    // Grupowanie podobnych błędów
    if (this.config.groupSimilarErrors) {
      const count = (this.errorGroups.get(errorId) || 0) + 1;
      this.errorGroups.set(errorId, count);
      
      if (count > 1) {
        // Aktualizuj istniejący wpis zamiast dodawania nowego
        const existingIndex = this.logs.findIndex(log => log.id === errorId);
        if (existingIndex >= 0) {
          this.logs[existingIndex] = {
            ...errorLog,
            context: {
              ...errorLog.context,
              occurrences: count,
              firstOccurrence: this.logs[existingIndex].timestamp,
            }
          };
          return;
        }
      }
    }

    // Dodaj do logów i przestrzegaj limitu
    this.logs.push(errorLog);
    if (this.logs.length > this.config.maxLogsStored) {
      this.logs.shift(); // Usuń najstarszy wpis
    }

    // Wyślij na serwer, jeśli skonfigurowano
    if (this.config.shouldSendToServer && 
        this.config.serverUrl && 
        (level === LogLevel.ERROR || level === LogLevel.CRITICAL)) {
      this.sendToServer(errorLog);
    }

    // Zapisz logi w localStorage
    this.persistLogs();
  }

  /**
   * Sprawdza czy dany poziom logowania powinien być zapisany
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
      LogLevel.CRITICAL
    ];
    
    const minLevelIndex = levels.indexOf(this.config.minLevel);
    const currentLevelIndex = levels.indexOf(level);
    
    return currentLevelIndex >= minLevelIndex;
  }

  /**
   * Generuje unikalny identyfikator błędu
   */
  private generateErrorId(message: string): string {
    // Uproszczony algorytm - w produkcji można użyć bardziej zaawansowanego algorytmu haszującego
    return message
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 20) + 
      '-' + Date.now().toString(36).substring(4);
  }

  /**
   * Pobiera kontekst użytkownika
   */
  private getUserContext(): ErrorLog['userInfo'] {
    if (typeof window === 'undefined') return {};
    
    return {
      sessionId: this.sessionId,
      currentUrl: window.location.href,
      // Możesz dodać więcej informacji z aplikacji, np. aktualny region z Zustand store
    };
  }

  /**
   * Zapisuje logi do localStorage
   */
  private persistLogs(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Zapisujemy tylko błędy i wyższe poziomy, aby oszczędzić miejsce
      const criticalLogs = this.logs.filter(
        log => log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL
      );
      
      if (criticalLogs.length > 0) {
        localStorage.setItem('errorLogs', JSON.stringify(criticalLogs));
      }
    } catch (e) {
      // Ciche połknięcie błędu - nie chcemy rekursywnego logowania
    }
  }

  /**
   * Wysyła log na serwer
   */
  private async sendToServer(errorLog: Partial<ErrorLog>): Promise<void> {
    if (!this.config.serverUrl) return;
    
    try {
      const response = await fetch(this.config.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send error log: ${response.statusText}`);
      }
    } catch (e) {
      // Użyj oryginalnego console.error, aby uniknąć pętli nieskończonej
      this.originalConsoleError('Failed to send error log to server:', e);
    }
  }

  /**
   * Pobiera wszystkie zapisane logi
   */
  public getLogs(level?: LogLevel): ErrorLog[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Czyści wszystkie logi
   */
  public clearLogs(): void {
    this.logs = [];
    this.errorGroups.clear();
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('errorLogs');
    }
  }
}

// Eksportuj pojedynczą instancję
export const errorLogger = new ErrorLogger();

// Hook dla komponentów React
export function useErrorLogger() {
  return errorLogger;
}
