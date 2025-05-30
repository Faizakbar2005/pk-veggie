import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function CardDemandChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/horeca_demand.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  return (
  <div className="relative flex flex-col min-w-0 break-words bg-white rounded shadow-lg p-4">
  <h2 className="text-xl font-semibold mb-2">Permintaan Sayur Tertinggi di Wilayah JABODETABEK</h2>
  
  {/* Garis pemisah */}
  <div className="border-b border-gray-200 mb-4"></div>

  <div style={{ width: "100%", height: "50vh" }}>
    <ResponsiveContainer>
      <BarChart data={data} layout="vertical" margin={{ left: 25 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="wilayah" type="category" />
        <Tooltip />
        <Bar dataKey="jumlah" fill="#4caf50" />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

  );
}
