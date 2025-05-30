import React, { useEffect, useState } from "react";
import CardStats from "components/Cards/CardStats.js";

export default function HeaderStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/header-stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat statistik:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative bg-veggie-green md:pt-32 pb-32 pt-12">
      <div className="px-4 md:px-10 mx-auto w-full">
        <div>
          <div className="flex flex-wrap">
            {loading || !stats ? (
              <p className="text-white text-lg px-4">Memuat statistik...</p>
            ) : (
              <>
                <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                  <CardStats
                    statSubtitle="TOTAL HORECA"
                    statTitle={stats.total_horeca.toLocaleString()}
                    statDescripiron="Jumlah total tempat HoReCa di Jabodetabek"
                    statIconName="fas fa-layer-group"
                    statIconColor="bg-red-500"
                  />
                </div>
                <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                  <CardStats
                    statSubtitle="RATA-RATA RATING"
                    statTitle={stats.rata_rata_rating.toFixed(2)}
                    statDescripiron="Nilai rata-rata rating semua tempat"
                    statIconName="fas fa-chart-pie"
                    statIconColor="bg-orange-500"
                  />
                </div>
                <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                  <CardStats
                    statSubtitle="TEMPAT POPULER"
                    statTitle={stats.total_populer.toLocaleString()}
                    statArrow="up"
                    statPercent=""
                    statPercentColor=""
                    statDescripiron="Tempat dengan ulasan terbanyak"
                    statIconName="fas fa-fire"
                    statIconColor="bg-pink-500"
                  />
                </div>
                <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                  <CardStats
                    statSubtitle="TOTAL HORECA PER KATEGORI"
                    statTitle={
                      <div className="text-sm">
                        <span className="text-black font-bold">H: {stats.total_per_kategori.hotel}</span>{", "}
                        <span className="text-black font-bold">R: {stats.total_per_kategori.restaurant}</span>{", "}
                        <span className="text-black font-bold">K: {stats.total_per_kategori.cafe}</span>
                      </div>
                    }
                    statDescripiron="Jumlah tempat berdasarkan kategori Horeca"
                    statIconName="fas fa-list"
                    statIconColor="bg-lightBlue-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
