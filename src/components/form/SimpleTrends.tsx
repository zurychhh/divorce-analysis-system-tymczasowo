"use client"
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "2015", value: 1000 },
  { name: "2016", value: 1200 },
  { name: "2017", value: 1100 },
  { name: "2018", value: 1300 },
  { name: "2019", value: 1400 },
  { name: "2020", value: 1350 },
  { name: "2021", value: 1500 },
  { name: "2022", value: 1600 }
];

export default function SimpleTrends() {
  console.log("Rendering SimpleTrends component");
  
  return (
    <div style={{ width: '100%', height: '100%', border: '1px solid red' }}>
      <h3 style={{ textAlign: 'center' }}>Prosty wykres testowy</h3>
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#8884d8" 
              strokeWidth={2}
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
