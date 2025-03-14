"use client"

import React, { useState, useEffect } from 'react';
import { errorLogger, LogLevel, ErrorLog } from '@/lib/errorLogger';

/**
 * Komponent do wyświetlania logów błędów
 * Przydatny podczas rozwoju i debugowania aplikacji
 */
export const ErrorLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Inicjalizuj logger jeśli jeszcze nie został zainicjalizowany
    errorLogger.init();
    
    // Funkcja do aktualizacji logów
    const updateLogs = () => {
      const allLogs = filter === 'all' 
        ? errorLogger.getLogs() 
        : errorLogger.getLogs(filter);
      
      setLogs([...allLogs].reverse()); // Najnowsze na górze
    };
    
    // Początkowo załaduj logi
    updateLogs();
    
    // Utwórz interwał do regularnej aktualizacji logów
    const interval = setInterval(updateLogs, 2000);
    
    return () => clearInterval(interval);
  }, [filter]);

  const toggleExpand = (id: string) => {
    setIsExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const clearLogs = () => {
    errorLogger.clearLogs();
    setLogs([]);
  };

  // Generuj szacunkową wartość koloru dla danego poziomu logowania
  const getLevelColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG: return 'text-blue-500';
      case LogLevel.INFO: return 'text-green-500';
      case LogLevel.WARN: return 'text-yellow-500';
      case LogLevel.ERROR: return 'text-red-500';
      case LogLevel.CRITICAL: return 'text-purple-600 font-bold';
      default: return 'text-gray-500';
    }
  };

  // Formatowanie timestamp na czytelną datę
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Logi błędów</h2>
        
        <div className="flex gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as LogLevel | 'all')}
            className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">Wszystkie</option>
            <option value={LogLevel.DEBUG}>Debug</option>
            <option value={LogLevel.INFO}>Info</option>
            <option value={LogLevel.WARN}>Warning</option>
            <option value={LogLevel.ERROR}>Error</option>
            <option value={LogLevel.CRITICAL}>Critical</option>
          </select>
          
          <button 
            onClick={clearLogs}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Wyczyść
          </button>
        </div>
      </div>
      
      {logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Brak zarejestrowanych błędów
        </div>
      ) : (
        <div className="overflow-y-auto max-h-96">
          {logs.map((log) => (
            <div 
              key={`${log.id}-${log.timestamp}`}
              className="mb-2 border-b pb-2 dark:border-gray-700"
            >
              <div 
                className="flex justify-between items-start cursor-pointer"
                onClick={() => toggleExpand(log.id)}
              >
                <div className="flex items-center">
                  <span className={`mr-2 ${getLevelColor(log.level)}`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 mr-2">
                    {formatTime(log.timestamp)}
                  </span>
                  <span className="font-medium">
                    {log.message.length > 80 
                      ? `${log.message.substring(0, 80)}...` 
                      : log.message}
                  </span>
                </div>
                <button className="text-gray-500">
                  {isExpanded[log.id] ? '▲' : '▼'}
                </button>
              </div>
              
              {isExpanded[log.id] && (
                <div className="mt-2 pl-4 text-sm">
                  <div className="mb-1">
                    <span className="font-semibold">ID: </span>
                    <span className="font-mono">{log.id}</span>
                  </div>
                  
                  {log.context && (
                    <div className="mb-1">
                      <span className="font-semibold">Kontekst: </span>
                      <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.context, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {log.userInfo && (
                    <div className="mb-1">
                      <span className="font-semibold">Informacje o użytkowniku: </span>
                      <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.userInfo, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {log.stack && (
                    <div>
                      <span className="font-semibold">Stack trace: </span>
                      <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto text-xs">
                        {log.stack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
