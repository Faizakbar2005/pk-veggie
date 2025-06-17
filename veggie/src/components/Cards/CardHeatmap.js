import React, { useState } from "react";

export default function CardHeatmap() {
  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-xl mt-32 md:mt-40">
      {/* Header */}
      <div className="rounded-t-xl px-4 py-3 bg-green-100 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
        <h6 className="text-xl font-semibold mb-2 md:mb-0">
          Heatmap Permintaan Sayur di JABODETABEK
        </h6>

        {/* Legend dots with tooltip */}
        <div className="flex items-center space-x-2">
          {[
            { color: "#0000ff", label: "Sangat Rendah" },
            { color: "#00ffff", label: "Rendah" },
            { color: "#00ff80", label: "Agak Rendah" },
            { color: "#80ff00", label: "Sedang" },
            { color: "#ffff00", label: "Cukup Tinggi" },
            { color: "#ff8000", label: "Tinggi" },
            { color: "#ff0000", label: "Sangat Tinggi" },
          ].map((item, idx) => (
            <LegendDot key={idx} color={item.color} label={item.label} />
          ))}
        </div>
      </div>

      {/* Body (Iframe Map) */}
      <div className="flex-auto px-4 py-4">
        <div className="w-full rounded-lg overflow-hidden border" style={{ height: "56vh" }}>
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

// LegendDot component with tooltip on hover
function LegendDot({ color, label }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div className="mb-2 px-2 py-1 rounded bg-black text-white text-xs shadow-lg z-50 absolute -top-7 whitespace-nowrap">
          {label}
        </div>
      )}
      {/* Dot */}
      <div
        className="w-8 h-6 rounded-full border shadow"
        style={{ backgroundColor: color, borderColor: color }}
      ></div>
    </div>
  );
}
