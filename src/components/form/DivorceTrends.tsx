"use client"
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DivorceTrendsProps {
  selectedRegion: string;
}

const DivorceTrends: React.FC<DivorceTrendsProps> = ({ selectedRegion }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch("/api/gus")
      .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(response => {
        if (response.status === "success" || response.fallbackData) {
          // Normalize selected region name for comparison
          const normalizedRegion = selectedRegion.toUpperCase();
          
          // Create chart data with years as data points
          const chartData = (response.metadata?.years || [])
            .sort((a, b) => a - b)
            .map(year => {
              const yearData = { year: year.toString() };
              
              // Find data for selected region
              const regionData = Object.values(response.data || {})
                .find((r: any) => r.name?.toUpperCase() === normalizedRegion);
              
              if (regionData) {
                // Add data for selected region
                yearData[regionData.name] = Number(regionData.values[year]) || 0;
                
                // Calculate national average
                const allValues = Object.values(response.data)
                  .map((r: any) => Number(r.values[year]) || 0)
                  .filter(v => !isNaN(v));
                
                if (allValues.length > 0) {
                  const average = Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length);
                  yearData["ŚREDNIA KRAJOWA"] = average;
                }
              }
              
              return yearData;
            });
          
          setData(chartData);
        } else {
          throw new Error(response.message || "Unknown API error");
        }
      })
      .catch(err => {
        console.error("Error fetching divorce data:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedRegion]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse text-center p-4">
          <p className="text-gray-500 dark:text-gray-400">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-500 dark:text-red-400">
            Wystąpił błąd: {error}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Spróbuj odświeżyć stronę lub wybierz inne województwo.
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-gray-500 dark:text-gray-400">
            Brak danych dla województwa {selectedRegion}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
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
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DivorceTrends;
