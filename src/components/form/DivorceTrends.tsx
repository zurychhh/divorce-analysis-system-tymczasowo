"use client"
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDivorceData } from "@/hooks/useDivorceData";

interface DivorceTrendsProps {
  selectedRegion: string;
}

/**
 * Komponent do wyświetlania wykresów trendów rozwodowych
 * 
 * @param selectedRegion - Wybrane województwo
 */
const DivorceTrends: React.FC<DivorceTrendsProps> = ({ selectedRegion }) => {
  // Użyj hooka do pobierania danych
  const { data, status, error, refetch } = useDivorceData(selectedRegion);

  // Renderowanie stanu ładowania
  if (status === 'loading') {
    return (
      <div className="w-full h-full flex items-center justify-center" role="status" aria-live="polite">
        <div className="animate-pulse text-center p-4">
          <p className="text-gray-500 dark:text-gray-400">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  // Renderowanie stanu błędu
  if (status === 'error') {
    return (
      <div className="w-full h-full flex items-center justify-center" role="alert" aria-live="assertive">
        <div className="text-center p-4">
          <p className="text-red-500 dark:text-red-400">
            Wystąpił błąd: {error}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Spróbuj odświeżyć stronę lub wybierz inne województwo.
          </p>
          <button 
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            aria-label="Spróbuj ponownie pobrać dane"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  // Renderowanie braku danych
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center" role="status">
        <div className="text-center p-4">
          <p className="text-gray-500 dark:text-gray-400">
            Brak danych dla województwa {selectedRegion}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full">
      {/* Wykres trendów */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="year" 
            label={{ value: 'Rok', position: 'insideBottomRight', offset: -10 }}
          />
          <YAxis 
            label={{ value: 'Liczba rozwodów', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Legend />
          {Object.keys(data[0])
            .filter(key => key !== "year")
            .map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={key === "ŚREDNIA KRAJOWA" ? "#888" : "#ff0000"}
                strokeWidth={key === "ŚREDNIA KRAJOWA" ? 1 : 2}
                dot
                activeDot={{ r: 8 }}
                name={key}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Optymalizacja renderowania - komponent zmienia się tylko przy zmianie regionu
export default React.memo(DivorceTrends);
