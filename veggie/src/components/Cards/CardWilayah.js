import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const CardWilayah = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://374d-202-51-197-10.ngrok-free.app/horeca-per-wilayah")
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch((err) => console.error("Gagal fetch wilayah:", err));
  }, []);

  return (
<div className="p-4 bg-white rounded-2xl shadow-md">
  <h2 className="text-xl font-semibold mb-2">
    Jumlah HORECA per Wilayah
  </h2>

  {/* Garis pemisah */}
  <div className="border-b border-gray-200 mb-4"></div>

  {data.length === 0 ? (
    <p className="text-gray-500">Memuat data...</p>
  ) : (
    <ResponsiveContainer width="100%" height={345}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 50, bottom: 20, left: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="wilayah" type="category" />
        <Tooltip />
        <Bar dataKey="jumlah" fill="#4caf50" />
      </BarChart>
    </ResponsiveContainer>
  )}
</div>

  );
};

export default CardWilayah;
