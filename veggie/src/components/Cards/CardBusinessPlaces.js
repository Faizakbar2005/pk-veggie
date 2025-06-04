import React, { useState } from "react";
import axios from "axios";
import "../../assets/styles/places.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faLocationDot } from '@fortawesome/free-solid-svg-icons'


export default function CardBusinessPlaces({ onAddFavorite }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [userLocation, setUserLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const itemsPerPage = 5;

  // Fungsi untuk mendapatkan lokasi pengguna
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setErrorMessage("");

    if (!navigator.geolocation) {
      setErrorMessage("Geolocation tidak didukung oleh browser ini.");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setIsGettingLocation(false);
        
        // Otomatis cari HORECA terdekat setelah mendapat lokasi
        searchNearbyPlaces(location);
      },
      (error) => {
        let errorMsg = "Gagal mendapatkan lokasi: ";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += "Akses lokasi ditolak. Silakan izinkan akses lokasi.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += "Informasi lokasi tidak tersedia.";
            break;
          case error.TIMEOUT:
            errorMsg += "Waktu habis saat mencari lokasi.";
            break;
          default:
            errorMsg += "Terjadi kesalahan yang tidak diketahui.";
            break;
        }
        setErrorMessage(errorMsg);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 menit
      }
    );
  };

  // Fungsi untuk mencari tempat berdasarkan lokasi terkini
  const searchNearbyPlaces = async (location = userLocation) => {
    if (!location) {
      setErrorMessage("Lokasi tidak tersedia. Silakan aktifkan lokasi terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSelectedPlace(null);
    setCurrentPage(1);
    
    try {
      const response = await axios.get("https://poorly-real-ghoul.ngrok-free.app/search-nearby-places", {
        params: {
          lat: location.lat,
          lng: location.lng,
          radius: 5000, // 5km radius
          type: "restaurant|hotel|convenience_store|cafe|bakery|meal_takeaway",
          max_results: 20,
        },
      });
      setResults(response.data.results || []);
      
      if (response.data.results?.length === 0) {
        setErrorMessage("Tidak ada HORECA yang ditemukan di sekitar lokasi Anda.");
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan saat mencari tempat terdekat.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi pencarian manual (yang sudah ada)
  const searchPlaces = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setErrorMessage("");
    setSelectedPlace(null);
    setCurrentPage(1);
    try {
      const response = await axios.get("https://poorly-real-ghoul.ngrok-free.app/search-places", {
        params: {
          query: searchQuery,
          location: userLocation ? `${userLocation.lat},${userLocation.lng}` : "Indonesia",
          max_results: 20,
        },
      });
      setResults(response.data.results || []);
    } catch (err) {
      setErrorMessage("Terjadi kesalahan saat mencari tempat.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk menghitung jarak (opsional, untuk menampilkan jarak)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius bumi dalam km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

return (
  <div className="places-container">
    <div className="places-card">
      <div className="places-header">
        <h3 className="places-title">Pencarian Lokasi HORECA</h3>
      </div>

      {/* Location Status */}
      {userLocation && (
        <div className="mb-3">
          <p className="text-green-600 text-sm font-medium">
            📍 Lokasi terdeteksi: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
          </p>
        </div>
      )}

      {/* Search Section - Responsive Layout */}
      <div className="space-y-3">
        {/* Row 1: Search Input + Search Button + Location Button */}
        <div className="flex items-stretch space-x-2">
          {/* Search Input */}
          <div className="flex-grow relative">
            <input
              type="text"
              className="w-full h-full rounded-md border border-gray-300 px-4 py-2 pr-10 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ketikkan HORECA yang ingin anda cari ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchPlaces()}
            />
          </div>

          {/* Tombol Cari */}
          <button
            onClick={searchPlaces}
            disabled={isLoading}
            className="flex items-center justify-center rounded-md bg-custom-blue px-4 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition min-w-[3rem]"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <FontAwesomeIcon icon={faMagnifyingGlass} className="h-5 w-5" />
            )}
          </button>

          {/* Cari HORECA Terdekat - Di samping tombol cari */}
          <button
            onClick={getCurrentLocation}
            disabled={isGettingLocation || isLoading}
            className="flex items-center justify-center rounded-md bg-yellow-500 px-4 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap"
          >
            {isGettingLocation ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="hidden md:inline">Mengambil...</span>
                <span className="md:hidden">📍</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faLocationDot} className="h-5 w-5" />
                <span className="hidden md:inline">Terdekat</span>
                <span className="md:hidden sr-only">Cari Terdekat</span>
              </>
            )}
          </button>
        </div>

        {/* Row 2: Reset & Refresh Buttons - Only show when userLocation exists */}
        {userLocation && (
          <div className="flex flex-wrap gap-2">
            {/* Reset Lokasi */}
            <button
              onClick={() => setUserLocation(null)}
              disabled={isLoading}
              className="flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              <span className="mr-1">🔁</span>
              <span>Reset Lokasi</span>
            </button>

            {/* Refresh Terdekat */}
            <button
              onClick={() => searchNearbyPlaces()}
              disabled={isLoading}
              className="flex items-center justify-center rounded-md border border-blue-600 px-3 py-2 text-blue-600 font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              <span className="mr-1">🔄</span>
              <span>Refresh Terdekat</span>
            </button>
          </div>
        )}
      </div>
    </div>


      {/* Error Message */}
      {errorMessage && (
        <div className="error-message mt-4">
          <p>{errorMessage}</p>
        </div>
      )}

        {/* Search Results */}
        {paginatedResults.length > 0 && !selectedPlace && (
          <>
            <div className="results-grid">
              {paginatedResults.map((place) => (
                <div
                  key={place.id || place.place_id}
                  className="place-card"
                  onClick={() => setSelectedPlace(place)}
                >
                  <h4 className="place-name">{place.displayName?.text || place.name}</h4>
                  <p className="place-address">{place.formattedAddress || place.formatted_address}</p>
                  <div className="place-rating">
                    <span>⭐ {place.rating || "N/A"}</span>
                    {(place.userRatingCount || place.user_ratings_total) && (
                      <span>
                        ({place.userRatingCount || place.user_ratings_total} ulasan)
                      </span>
                    )}
                  </div>
                  {/* Tampilkan jarak jika lokasi pengguna tersedia */}
                  {userLocation && place.geometry?.location && (
                    <div className="place-distance">
                      📍 {calculateDistance(
                        userLocation.lat, 
                        userLocation.lng, 
                        place.geometry.location.lat, 
                        place.geometry.location.lng
                      )} km
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </button>
              <span className="page-info">Halaman {currentPage} dari {totalPages}</span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Berikutnya
              </button>
            </div>
          </>
        )}

        {/* Detail Place View */}
        {selectedPlace && (
          <div className="detail-container">
            <div className="detail-header">
              <button onClick={() => setSelectedPlace(null)} className="back-button">
                ← Kembali
              </button>
              <h4 className="detail-title">
                {selectedPlace.displayName?.text || selectedPlace.name}
              </h4>
              <div></div>
            </div>

            <div className="detail-content">
              <div className="detail-info">
                <p><strong>Alamat:</strong> {selectedPlace.formattedAddress || selectedPlace.formatted_address}</p>
                <p><strong>Rating:</strong> {selectedPlace.rating || "N/A"}</p>
                {(selectedPlace.userRatingCount || selectedPlace.user_ratings_total) && (
                  <p><strong>Jumlah Ulasan:</strong> {selectedPlace.userRatingCount || selectedPlace.user_ratings_total}</p>
                )}
                <p><strong>Jenis Tempat:</strong> {selectedPlace.types?.[0] || "N/A"}</p>
                {/* Tampilkan jarak di detail */}
                {userLocation && selectedPlace.geometry?.location && (
                  <p><strong>Jarak:</strong> {calculateDistance(
                    userLocation.lat, 
                    userLocation.lng, 
                    selectedPlace.geometry.location.lat, 
                    selectedPlace.geometry.location.lng
                  )} km dari lokasi Anda</p>
                )}
                {selectedPlace.website && (
                  <p>
                    <strong>Website:</strong>{" "}
                    <a href={selectedPlace.website} target="_blank" rel="noreferrer"
                      className="text-blue-600 underline ml-1">
                      {selectedPlace.website}
                    </a>
                  </p>
                )}
                {selectedPlace.formatted_phone_number && (
                  <p><strong>Telepon:</strong> {selectedPlace.formatted_phone_number}</p>
                )}

                <div className="action-buttons">
                  <button
                    className="action-button copy-button"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        selectedPlace.formattedAddress || selectedPlace.formatted_address
                      )
                    }
                  >
                    Salin Alamat
                  </button>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      selectedPlace.formattedAddress || selectedPlace.formatted_address
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button className="action-button map-button">Buka di Google Maps</button>
                  </a>
                  <button
                    className="action-button select-button bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={() => {
                      onAddFavorite && onAddFavorite(selectedPlace);
                    }}
                  >
                    Simpan ke Favorit
                  </button>
                </div>
              </div>

              {selectedPlace.photos?.length > 0 && selectedPlace.photos[0].name ? (
                <div className="photo-container">
                  <img
                    src={`https://places.googleapis.com/v1/${selectedPlace.photos[0].name}/media?maxWidthPx=600&key=AIzaSyD7LDPmOrB9LL6pKYz9SQi28a71ORNqdpU`}
                    alt="Foto tempat"
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ) : (
                <div className="photo-placeholder">Tidak ada foto tersedia</div>
              )}
            </div>
          </div>
        )}
      </div>
  
  );
}