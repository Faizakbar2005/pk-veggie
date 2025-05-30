import React from "react";

export default function MapExample() {
  return (
    <div className="w-full h-screen px-4 py-6">
      
      <div className="rounded-lg shadow-lg overflow-hidden h-full">
        <iframe
          title="Heatmap"
          src="/maps/heatmap.html"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
