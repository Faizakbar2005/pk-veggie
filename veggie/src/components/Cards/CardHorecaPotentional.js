import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function CardHorecaPotential() {
  const [horecaData, setHorecaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWilayah, setSelectedWilayah] = useState("All");
  const [limit, setLimit] = useState(10);
  const [placeNames, setPlaceNames] = useState({});
  const [visibleCount, setVisibleCount] = useState(5); // Default tampilkan 5
  const placeNameCache = useRef({});

  const wilayahOptions = [
    "All",
    "Tangerang",
    "Bekasi",
    "Jakarta Selatan",
    "Bogor",
    "Jakarta Barat",
    "Jakarta Timur",
    "Jakarta Pusat",
    "Depok",
    "Jakarta Utara"
  ];

  const fetchPlaceName = async (placeId) => {
    if (placeNameCache.current[placeId]) {
      return placeNameCache.current[placeId];
    }

    try {
      const response = await axios.get(
        `https://poorly-real-ghoul.ngrok-free.app/place-details?place_id=${placeId}`
      );
      const name = response.data.data.displayName?.text || placeId;
      placeNameCache.current[placeId] = name;
      return name;
    } catch (error) {
      console.error(`Failed to fetch place name for ${placeId}:`, error);
      return placeId;
    }
  };

  const fetchAllPlaceNames = async (data) => {
    // Pastikan data adalah array sebelum menggunakan map
    if (!Array.isArray(data)) {
      console.error("fetchAllPlaceNames: data is not an array", data);
      return;
    }

    const names = {};
    const promises = data.map(async (item) => {
      const placeId = item.name.replace('places/', '');
      names[placeId] = await fetchPlaceName(placeId);
    });
    
    await Promise.all(promises);
    setPlaceNames(names);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = `https://poorly-real-ghoul.ngrok-free.app/top-horeca?limit=${limit}`;
      
      if (selectedWilayah && selectedWilayah !== "All") {
        url += `&wilayah=${encodeURIComponent(selectedWilayah)}`;
      }
      
      const response = await axios.get(url);
      
      // Debug: log the response structure
      console.log("API Response:", response.data);
      console.log("Response type:", typeof response.data);
      console.log("Is array:", Array.isArray(response.data));
      
      // Handle different response structures
      let horecaArray = [];
      
      if (Array.isArray(response.data)) {
        // If response.data is directly an array
        horecaArray = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // If the array is nested in response.data.data
        horecaArray = response.data.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        // If the array is nested in response.data.results
        horecaArray = response.data.results;
      } else if (response.data && Array.isArray(response.data.horeca)) {
        // If the array is nested in response.data.horeca
        horecaArray = response.data.horeca;
      } else {
        // If none of the above, log the structure and set empty array
        console.error("Unexpected API response structure:", response.data);
        horecaArray = [];
      }
      
      setHorecaData(horecaArray);
      await fetchAllPlaceNames(horecaArray);
    } catch (error) {
      console.error("Failed to fetch HORECA data:", error);
      setHorecaData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setVisibleCount(5); // Reset tampilan ke 5 saat filter berubah
  }, [selectedWilayah, limit]);

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
      return <span className="inline-block h-4 bg-gray-200 rounded w-3/4"></span>;
    }
    
    return <>{name}</>;
  };

  const ProgressBar = ({ score }) => (
    <div className="flex items-center">
      <span className="text-sm font-medium text-gray-900 w-8 mr-2">
        {Math.round(score)}
      </span>
      <div className="w-full">
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            style={{ width: `${Math.min(100, score)}%` }}
            className={`absolute h-full rounded-full ${
              score > 45 ? "bg-emerald-500" :
              score > 40 ? "bg-yellow-500" :
              "bg-red-500"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header dengan filter */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Top {visibleCount} HORECA Potensial
              {selectedWilayah !== "All" && (
                <span className="text-gray-600"> di {selectedWilayah}</span>
              )}
            </h3>

            {/* Garis pemisah */}
            <div className=" border-gray-200 mt-4"></div>
          </div>
              
          <div className="flex flex-col xs:flex-row gap-2">
            <div className="relative flex-1 min-w-[150px]">
              <select
                className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                value={selectedWilayah}
                onChange={(e) => setSelectedWilayah(e.target.value)}
              >
                {wilayahOptions.map((wilayah) => (
                  <option key={wilayah} value={wilayah}>
                    {wilayah === "All" ? "Semua Wilayah" : wilayah}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            
            <div className="relative flex-1 min-w-[120px]">
              <select
                className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                value={visibleCount}
                onChange={(e) => setVisibleCount(Number(e.target.value))}
              >
                <option value={5}>5 Data</option>
                <option value={10}>10 Data</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Konten */}
      <div className="overflow-hidden">
        {loading ? (
          <div className="p-6 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        ) : horecaData.length === 0 ? (
          <div className="p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {selectedWilayah === "All" 
                ? "Tidak ada data HORECA yang ditemukan" 
                : `Tidak ada data HORECA di wilayah ${selectedWilayah}`}
            </h3>
          </div>
        ) : (
          <>
            {/* Desktop View (Table) */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Tempat
                      </th>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Wilayah
                      </th>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reviews
                      </th>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Potensi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {horecaData.slice(0, visibleCount).map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 max-w-[200px] truncate">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            <PlaceName placeId={item.name} />
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {item.wilayah}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">★</span>
                            <span className="text-sm text-gray-900 font-medium">
                              {item.rating}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {item.review_count.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <ProgressBar score={item.score} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-3 p-4">
              {horecaData.slice(0, visibleCount).map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        <PlaceName placeId={item.name} />
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{item.wilayah}</p>
                    </div>
                    <div className="flex items-center ml-2">
                      <span className="text-yellow-500 text-sm mr-1">★</span>
                      <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Reviews</p>
                      <p className="text-sm">{item.review_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Potensi</p>
                      <ProgressBar score={item.score} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500">
          Menampilkan {Math.min(visibleCount, horecaData.length)} dari {horecaData.length} data
        </p>
      </div>
    </div>
  );
}