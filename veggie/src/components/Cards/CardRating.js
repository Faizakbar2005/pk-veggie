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

const CardVegetarianRatio = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/vegetarian.json")
      .then((res) => res.json())
      .then((json) => {
        const sorted = json.sort((a, b) => b["Vegetarian %"] - a["Vegetarian %"]);
        setData(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal fetch data vegetarian.json:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-2">Rasio Restoran Menyajikan Makanan Sayuran di Wilayah JABODETABEK</h2>
      <div className="border-b border-gray-200 mb-4"></div>

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : data.length === 0 ? (
        <p className="text-red-500">Data tidak tersedia atau kosong.</p>
      ) : (
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="wilayah"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={60}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[0, "dataMax + 1"]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              formatter={(value) => `${value.toFixed(2)}%`}
              labelFormatter={(label) => `Wilayah: ${label}`}
            />
            <Bar dataKey="Vegetarian %" fill="#2E8B57" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CardVegetarianRatio;
