import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function CardDemandChart() {
  const [data, setData] = useState([]);
  const [topRegion, setTopRegion] = useState(null);

  useEffect(() => {
    fetch("/horeca_demand.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        if (json.length > 0) {
          const maxItem = json.reduce((prev, curr) =>
            curr["Skor Prediksi"] > prev["Skor Prediksi"] ? curr : prev
          );
          setTopRegion(maxItem);
        }
      });
  }, []);

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white rounded shadow-lg p-4 mt-32 md:mt-40">
      <h2 className="text-xl font-semibold mb-1">
        Permintaan Sayur Tertinggi di Wilayah JABODETABEK
      </h2>

      {/* Wilayah dengan skor tertinggi */}
      {topRegion && (
        <p className="text-sm text-green-700 font-medium mb-2">
          🌟 Wilayah Tertinggi:{" "}
          <span className="font-semibold">{topRegion.wilayah}</span> (
          Skor: <span className="font-semibold">{topRegion["Skor Prediksi"]}</span>)
        </p>
      )}

      {/* Garis pemisah */}
      <div className="border-b border-gray-200 mb-4"></div>

      <div style={{ width: "100%", height: "50vh" }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 25 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="wilayah" type="category" />
            <Tooltip />
            <Bar dataKey="Skor Prediksi" fill="#4caf50" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
