import React, { useEffect, useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CardRating = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data dari FastAPI backend
  useEffect(() => {
    fetch("https://poorly-real-ghoul.ngrok-free.app/correlation-data")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((d) => ({
          rating: parseFloat(d["places.rating"]),
          reviewCount: parseInt(d["places.userRatingCount"]),
        }));
        setData(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal fetch dari backend:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-2">Korelasi Rating vs Jumlah Review</h2>

      {/* Garis pemisah */}
  <div className="border-b border-gray-200 mb-4"></div>

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : data.length === 0 ? (
        <p className="text-red-500">Data tidak tersedia atau kosong.</p>
      ) : (
<ResponsiveContainer width="100%" height={345}>
  <ScatterChart
    margin={{ top: 20, right: 20, bottom: 20, left: 40 }} // geser chart ke kanan
  >
    <CartesianGrid />
    <XAxis
      type="number"
      dataKey="rating"
      name="Rating"
      label={{ value: "Rating", position: "insideBottom", offset: -5 }}
      domain={[0, 5]}
    />
    <YAxis
      type="number"
      dataKey="reviewCount"
      name="Jumlah Review"
      label={{
        value: "Jumlah Review",
        angle: -90,
        position: "outsideLeft", // ⬅️ tetap di sisi kiri container
        dx: -50, // ⬅️ tarik lebih kiri secara manual
      }}
    />
    <Tooltip
      cursor={{ strokeDasharray: '3 3' }}
      formatter={(value, name) =>
        name === "rating"
          ? [`${value} bintang`, "Rating"]
          : [value, "Jumlah Review"]
      }
    />
    <Scatter name="Restoran" data={data} fill="#4caf50" />
  </ScatterChart>
</ResponsiveContainer>

      )}
    </div>
  );
};

export default CardRating;
