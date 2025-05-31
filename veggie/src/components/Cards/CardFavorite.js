import React, { useState } from "react";
import Papa from "papaparse";

export default function FavoriteHoReca({ favorites, onRemoveFavorite }) {
  const apiKey = "AIzaSyD7LDPmOrB9LL6pKYz9SQi28a71ORNqdpU";
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(favorites.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentFavorites = favorites.slice(startIdx, startIdx + itemsPerPage);

  const handleExportCSV = () => {
    const csv = Papa.unparse(
      favorites.map((place) => ({
        Nama: place.displayName?.text || place.name || "Tidak tersedia",
        Alamat: place.formattedAddress || place.formatted_address || "Tidak tersedia",
        Jenis: place.types?.join(", ") || "Tidak tersedia",
        ID: place.id || place.place_id || "Tidak tersedia",
        Rating: place.rating ?? "Tidak tersedia",
        "Jumlah Ulasan": place.userRatingCount ?? "Tidak tersedia",
        Telepon: place.nationalPhoneNumber || "Tidak tersedia",
        Website: place.websiteUri || "Tidak tersedia",
        "Terakhir Diupdate": place.updateTime || "Tidak tersedia",
        Latitude: place.location?.latitude ?? "Tidak tersedia",
        Longitude: place.location?.longitude ?? "Tidak tersedia"
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "horeca_favorites.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (favorites.length === 0) {
    return (
      <div className="favorite-container p-4 mt-8 border rounded bg-yellow-50">
        <h3 className="text-lg font-semibold mb-2">HORECA saved</h3>
        <p className="text-gray-600">Belum ada favorit disimpan.</p>
      </div>
    );
  }

  return (
    <div className="favorite-container p-4 mt-8 border rounded bg-yellow-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Daftar HORECA Favorit ({favorites.length})
        </h3>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2.5 bg-green-600 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v8m0 0l-4-4m4 4l4-4M4 4h16v4H4z"
            />
          </svg>
          Export ke CSV
        </button>
      </div>

      <div className="favorite-list space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {currentFavorites.map((place) => {
          const address = place.formattedAddress || place.formatted_address || "";
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
          const placeTypes = place.types?.length > 0 ? place.types.join(", ") : "Jenis tempat tidak tersedia";
          const photoName = place.photos?.[0]?.name;
          const photoUrl = photoName
            ? `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=300&key=${apiKey}`
            : null;

          return (
            <div
              key={place.id || place.place_id}
              className="favorite-item flex justify-between items-start gap-4 p-3 bg-white rounded-xl shadow border"
            >
              <div className="flex-1">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-gray-800 block"
                  title="Buka alamat di Google Maps"
                >
                  <h4 className="font-semibold text-base mb-1">
                    {place.displayName?.text || place.name || "Nama tidak tersedia"}
                  </h4>
                  <p className="text-sm text-gray-600">{address || "Alamat tidak tersedia"}</p>
                  <p className="text-xs text-gray-500 italic mt-1">
                    <strong>Jenis tempat:</strong> {placeTypes}
                  </p>
                </a>
                <button
                  onClick={() => onRemoveFavorite(place)}
                  className="text-red-600 hover:text-white hover:bg-red-600 font-medium px-3 py-1 mt-2 border border-red-600 rounded-md transition-all"
                >
                  Hapus
                </button>
              </div>

              <div className="flex-shrink-0">
                <img
                  src={photoUrl || "/no-image.png"}
                  alt={place.displayName?.text || place.name || "Foto tempat"}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              </div>
            </div>
          );
        })}
      </div>

{/* Pagination */}
<div className="flex justify-center mt-4 space-x-2">
  {currentPage > 1 && (
    <button
      onClick={() => setCurrentPage((prev) => prev - 1)}
      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
    >
      Sebelumnya
    </button>
  )}
  <span className="px-4 py-2 text-gray-700 font-medium">
    Halaman {currentPage} dari {totalPages}
  </span>
  {currentPage < totalPages && (
    <button
      onClick={() => setCurrentPage((prev) => prev + 1)}
      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
    >
      Selanjutnya
    </button>
  )}
</div>

    </div>
  );
}
