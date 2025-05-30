import React from "react";

export default function CardHeatmap() {
  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-xl">
      {/* Header */}
      <div className="rounded-t-xl px-4 py-3 bg-green-100 border-b border-gray-200">
        <h6 className="text-xl font-semibold ">
          Heatmap Permintaan Sayur di JABODETABEK
        </h6>
      </div>

      {/* Body (Iframe Map) */}
      <div className="flex-auto px-4 py-4">
        <div className="w-full rounded-lg overflow-hidden border" style={{ height: '53vh' }}>
          <iframe
            title="Heatmap"
            src="/maps/heatmap.html"
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
