import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

export default function CardNewsSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimeout = useRef(null);

  const fetchResults = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
       `https://poorly-real-ghoul.ngrok-free.app/search_news?keyword=${encodeURIComponent(searchQuery)}`
      );
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError("Gagal mengambil data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchResults(query);
    }, 500);
    return () => clearTimeout(debounceTimeout.current);
  }, [query]);

  const stripHtml = (html = "") => html.replace(/<[^>]+>/g, "");

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return isNaN(date) ? "-" : date.toLocaleDateString("id-ID");
  };

  return (
<div className="bg-white rounded-lg shadow-md overflow-hidden">
  <header className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
    <div className="flex items-center gap-2 mb-2 md:mb-0">
      <Search className="w-5 h-5 text-blue-600" />
      <h1 className="text-xl font-semibold text-gray-800 ml-2">
        Pencarian Berita Terkini
      </h1>
       </div>
    <div className="relative w-full md:w-64">
      <input
        type="text"
        placeholder="Cari berita"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
      />
      {loading && (
        <div className="absolute right-3 top-2.5">
          <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  </header>


      <div className="p-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {!loading && results.length === 0 && query.trim() !== "" && (
          <div className="text-center py-8 text-gray-500">
            Tidak ditemukan berita untuk kata kunci ini
          </div>
        )}

        {results.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((item, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg overflow-hidden p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {formatDate(item.date)}
                  </span>

                </div>
                <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  {stripHtml(item.title)}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                  {stripHtml(item.summary)}
                </p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600"
                >
                  Baca selengkapnya →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 text-right text-sm text-gray-500 border-t border-gray-200">
          Menampilkan {results.length} hasil pencarian
        </div>
      )}
    </div>
  );
}