import React, { useState, useEffect, useRef } from "react";
import SentimentAnalysis from "./SentimentAnalysis";

export default function Maps() {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [horecaData, setHorecaData] = useState([]);
  const [selectedWilayah, setSelectedWilayah] = useState("");
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [placeNames, setPlaceNames] = useState({});
  const placeNameCache = useRef({});

  // Wilayah options
  const wilayahOptions = [
    { value: "", label: "Semua Wilayah" },
    { value: "Jakarta Pusat", label: "Jakarta Pusat" },
    { value: "Jakarta Selatan", label: "Jakarta Selatan" },
    { value: "Jakarta Utara", label: "Jakarta Utara" },
    { value: "Jakarta Timur", label: "Jakarta Timur" },
    { value: "Jakarta Barat", label: "Jakarta Barat" },
    { value: "Bogor", label: "Bogor" },
    { value: "Depok", label: "Depok" },
    { value: "Tangerang", label: "Tangerang" },
    { value: "Bekasi", label: "Bekasi" }
  ];

  // Limit options
  const limitOptions = [
    { value: 5, label: "5 Data" },
    { value: 10, label: "10 Data" },
    { value: 15, label: "15 Data" },
    { value: 20, label: "20 Data" },
    { value: 50, label: "50 Data" }
  ];

  // Fetch place name from place ID
  const fetchPlaceName = async (placeId) => {
    if (placeNameCache.current[placeId]) {
      return placeNameCache.current[placeId];
    }

    try {
      const response = await fetch(
        `http://localhost:8080/place-details?place_id=${placeId}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch place details');
      
      const data = await response.json();
      const name = data.data.displayName?.text || placeId;
      placeNameCache.current[placeId] = name;
      return name;
    } catch (error) {
      console.error(`Failed to fetch place name for ${placeId}:`, error);
      return placeId;
    }
  };

  // Component for displaying place name
  const PlaceName = ({ placeId }) => {
    const id = placeId.replace('places/', '');
    const name = placeNames[id];
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
      if (!name && !isFetching) {
        setIsFetching(true);
        const fetchAndUpdate = async () => {
          const fetchedName = await fetchPlaceName(id);
          setPlaceNames(prev => ({...prev, [id]: fetchedName}));
          setIsFetching(false);
        };
        fetchAndUpdate();
      }
    }, [id, name, isFetching]);

    if (!name) {
      return (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      );
    }
    
    return <>{name}</>;
  };

  // Fetch HORECA data
  const fetchHorecaData = async (wilayah = "", limit = 10) => {
    try {
      setLoading(true);
      let url = `http://localhost:8080/top-horeca?limit=${limit}`;
      
      if (wilayah) {
        url += `&wilayah=${encodeURIComponent(wilayah)}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch HORECA data');
      
      const data = await response.json();
      setHorecaData(data);
      
    } catch (error) {
      console.error('Error fetching HORECA data:', error);
      setHorecaData([]);
    } finally {
      setLoading(false);
    }
  };

  // Search place in Google Places
  const searchPlaceByName = async (placeName, wilayah) => {
    try {
      const searchQuery = `${placeName} ${wilayah} Indonesia`;
      const response = await fetch(
        `http://localhost:8080/search-places?query=${encodeURIComponent(searchQuery)}&location=Indonesia&max_results=1`
      );
      
      if (!response.ok) throw new Error('Failed to search place');
      
      const data = await response.json();
      return data.results && data.results.length > 0 ? data.results[0] : null;
      
    } catch (error) {
      console.error('Error searching place:', error);
      return null;
    }
  };

  // Fetch place details
  const fetchPlaceDetails = async (placeId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8080/place-details?place_id=${placeId}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch place details');
      
      const data = await response.json();
      setPlaceDetails(data.data);
      
    } catch (error) {
      console.error('Error fetching place details:', error);
      setPlaceDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getWilayahColor = (wilayah) => {
    const colors = {
      'Jakarta Pusat': 'bg-purple-100 text-purple-800',
      'Jakarta Selatan': 'bg-blue-100 text-blue-800',
      'Jakarta Utara': 'bg-cyan-100 text-cyan-800',
      'Jakarta Timur': 'bg-orange-100 text-orange-800',
      'Jakarta Barat': 'bg-yellow-100 text-yellow-800',
      'Bogor': 'bg-green-100 text-green-800',
      'Depok': 'bg-teal-100 text-teal-800',
      'Tangerang': 'bg-indigo-100 text-indigo-800',
      'Bekasi': 'bg-pink-100 text-pink-800'
    };
    return colors[wilayah] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('hotel') || lowerName.includes('inn') || lowerName.includes('resort')) {
      return '🏨';
    } else if (lowerName.includes('cafe') || lowerName.includes('coffee') || lowerName.includes('starbucks')) {
      return '☕';
    } else {
      return '🍽️';
    }
  };

  // Handle place selection
  const handleSelectHoreca = async (horeca) => {
    setSelectedPlace(horeca);
    setPlaceDetails(null);
    
    // Get the actual place name from placeNames state
    const placeId = horeca.name.replace('places/', '');
    const actualPlaceName = placeNames[placeId] || horeca.name;
    
    const googlePlace = await searchPlaceByName(actualPlaceName, horeca.wilayah);
    
    if (googlePlace && googlePlace.id) {
      await fetchPlaceDetails(googlePlace.id);
    } else {
      setPlaceDetails({
        displayName: { text: actualPlaceName },
        formattedAddress: horeca.wilayah,
        rating: horeca.rating,
        userRatingCount: horeca.review_count,
        reviews: []
      });
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = () => {
    fetchHorecaData(selectedWilayah, selectedLimit);
    setSelectedPlace(null);
    setPlaceDetails(null);
  };

  // Initial load
  useEffect(() => {
    fetchHorecaData(selectedWilayah, selectedLimit);
  }, []);

  // Update when filters change
  useEffect(() => {
    handleFilterChange();
  }, [selectedWilayah, selectedLimit]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="relative z-10 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          HORECA Analytics 
        </h1>
        <p className="text-gray-600">
          Analisis sentimen detail HORECA di wilayah Jabodetabek
        </p>
      </div>

      {/* Filter Section */}
      <div className="favorite-container p-4 mt-8 border rounded bg-yellow-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah</label>
            <select
              value={selectedWilayah}
              onChange={(e) => setSelectedWilayah(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {wilayahOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Data</label>
            <select
              value={selectedLimit}
              onChange={(e) => setSelectedLimit(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {limitOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* HORECA List - 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full border border-gray-100">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Daftar HORECA
                  <span className="text-gray-600"> di {selectedWilayah}</span>
                </h3>
                {selectedWilayah && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedWilayah}
                  </span>
                )}
              </div>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
              </div>
            )}
            
            {/* Data List */}
            {!loading && horecaData.length > 0 && (
              <div className="divide-y divide-gray-200 h-[calc(100vh-250px)] overflow-y-auto">
                {horecaData.map((horeca, index) => {
                  const placeId = horeca.name.replace('places/', '');
                  const actualPlaceName = placeNames[placeId];
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handleSelectHoreca(horeca)}
                      className={`p-4 cursor-pointer transition-colors duration-150 ${
                        selectedPlace?.name === horeca.name
                          ? 'bg-blue-50 border-l-4 border-l-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 text-blue-600">
                            {getCategoryIcon(actualPlaceName || horeca.name)}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title and Region */}
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              <PlaceName placeId={horeca.name} />
                            </h4>
                            <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full ${getWilayahColor(horeca.wilayah)}`}>
                              {horeca.wilayah}
                            </span>
                          </div>
                          
                          {/* Rating */}
                          <div className="mt-1.5 flex items-center">
                            <div className="flex items-center">
                              <span className="text-yellow-400">★</span>
                              <span className="ml-1 text-sm font-medium text-gray-700">
                                {horeca.rating}
                              </span>
                            </div>
                            <span className="mx-4 text-gray-300">|</span>  
                            <span className="text-xs text-gray-500">
                              {horeca.review_count} ulasan
                            </span>
                          </div>
                          
                          {/* Score */}
                          <div className="mt-2">
                            <div className="flex items-center">
                              <span className="text-xs font-medium text-gray-500">Skor:</span>
                              <span className="ml-1 text-xs font-semibold text-blue-600">
                                {horeca.score.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
                  
            {!loading && horecaData.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500">Tidak ada data HORECA untuk wilayah yang dipilih</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Section - 3 columns */}
        <div className="lg:col-span-3">
          {selectedPlace ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Place Info */}
              <div className="favorite-container p-4 mt-8 border rounded bg-yellow-50">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <span className="text-4xl mr-4">{getCategoryIcon(selectedPlace.name)}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900"><PlaceName placeId={selectedPlace.name} /></h2>
                      <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${getWilayahColor(selectedPlace.wilayah)}`}>
                        {selectedPlace.wilayah}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedPlace.score.toFixed(1)}
                      <span className="text-sm font-normal text-gray-500 ml-1">/10</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Overall Score</div>
                  </div>
                </div>

                {/* Detail Information */}
                <div className="space-y-5">
                  {/* Rating */}
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center mr-4">
                      <span className="text-yellow-500 text-xl">★</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Rating</h4>
                      <div className="flex items-baseline mt-1">
                        <p className="text-2xl font-semibold text-gray-900">
                          {selectedPlace.rating}
                        </p>
                        <span className="ml-2 text-sm text-gray-500">
                          ({selectedPlace.review_count} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  {placeDetails?.formattedAddress && (
                    <div className="flex p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                        <span className="text-blue-500 text-xl">📍</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Alamat</h4>
                        <p className="mt-1 text-gray-900">
                          {placeDetails.formattedAddress}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {placeDetails?.nationalPhoneNumber && (
                      <div className="flex p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mr-4">
                          <span className="text-green-500 text-xl">📞</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Telepon</h4>
                          <p className="mt-1 text-gray-900 font-medium">
                            {placeDetails.nationalPhoneNumber}
                          </p>
                        </div>
                      </div>
                    )}

                    {placeDetails?.websiteUri && (
                      <div className="flex p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center mr-4">
                          <span className="text-purple-500 text-xl">🌐</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Website</h4>
                          <a 
                            href={placeDetails.websiteUri} 
                            target="_blank"
                            className="mt-1 text-blue-600 hover:underline block truncate"
                          >
                            {placeDetails.websiteUri.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Sentiment Analysis Component */}
              <SentimentAnalysis 
                placeDetails={placeDetails}
                loading={loading}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center h-full flex items-center justify-center">
              <div className="mx-auto max-w-md">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Pilih Bisnis HORECA</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Klik salah satu bisnis dari daftar di sebelah kiri untuk melihat detail dan analisis sentimen.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}