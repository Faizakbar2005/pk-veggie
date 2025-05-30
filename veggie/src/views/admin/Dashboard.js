import React from "react";

// components
import CardHeatmap from "components/Cards/CardHeatmap";
import CardDemandChart from "components/Cards/CardDemandChart.js";
import CardSearchNews from "components/Cards/CardSearchNews";
import CardSocialTraffic from "components/Cards/CardHorecaPotentional";
import CardRating from "components/Cards/CardRating";
import CardWilayah from "components/Cards/CardWilayah"; // ← tambahkan ini

export default function Dashboard() {
  return (
    <>
      <div className="flex flex-wrap">
        {/* Line Chart dan Demand Chart */}
        <div className="w-full xl:w-8/12 mb-12 px-4">
          <CardHeatmap />
        </div>
        <div className="w-full xl:w-4/12 mb-12 px-4">
          <CardDemandChart />
        </div>

        {/* Rating dan Social Traffic */}
        <div className="w-full xl:w-8/12 mb-12 px-4">
          <CardWilayah />
          <div className="mt-6">
            <CardRating /> {/* ← Tambahkan di sini */}
          </div>
        </div>
        <div className="w-full xl:w-4/12 mb-12 px-4">
          <div className="max-h-[500px] overflow-y-auto">
            <CardSocialTraffic />
          </div>
        </div>

        {/* Page Visits */}
        <div className="w-full px-4">
          <CardSearchNews />
        </div>
      </div>
    </>
  );
}
