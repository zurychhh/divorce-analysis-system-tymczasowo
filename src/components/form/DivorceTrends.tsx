"use client"
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DivorceTrends = ({ selectedRegion }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/gus")
      .then(res => res.json())
      .then(response => {
        if (response.status === "success") {
          // Konwertujemy nazwę regionu do formatu z API
          const normalizedRegion = selectedRegion.toUpperCase();
          
          const chartData = response.metadata.years
            .sort((a, b) => b - a)
            .map(year => {
              const yearData = { year: year.toString() };
              
              // Znajdujemy dane dla wybranego województwa
              const regionData = Object.values(response.data)
                .find(r => r.name.toUpperCase() === normalizedRegion);
              
              if (regionData) {
                // Dane dla wybranego województwa
                yearData[regionData.name] = Number(regionData.values[year]) || 0;
                
                // Obliczamy średnią krajową
                const allValues = Object.values(response.data)
                  .map(r => Number(r.values[year]) || 0);
                const average = Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length);
                yearData["ŚREDNIA KRAJOWA"] = average;
              }
              
              return yearData;
            });
          
          setData(chartData);
        }
      });
  }, [selectedRegion]);

  if (!data) return null;

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
              strokeWidth={2}
              dot
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DivorceTrends;
