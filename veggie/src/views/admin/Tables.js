import React, { useState, useEffect } from "react";

// components
import CardTable from "components/Cards/CardBusinessPlaces";
import FavoriteHoReCa from "components/Cards/CardFavorite";

export default function Tables() {
  const [favorites, setFavorites] = useState(() => {
    // Load dari localStorage kalau ada
    const stored = localStorage.getItem("favoritePlaces");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("favoritePlaces", JSON.stringify(favorites));
  }, [favorites]);

  const handleAddFavorite = (place) => {
    const id = place.id || place.place_id;
    const isExist = favorites.some((fav) => (fav.id || fav.place_id) === id);
    if (!isExist) {
      setFavorites([...favorites, place]);
      alert("Tempat berhasil disimpan ke favorit!");
    } else {
      alert("Tempat sudah ada di favorit.");
    }
  };

  const handleRemoveFavorite = (placeToRemove) => {
    const id = placeToRemove.id || placeToRemove.place_id;
    setFavorites(favorites.filter((fav) => (fav.id || fav.place_id) !== id));
  };

  return (
    <>
      <div className="flex flex-wrap mt-12">
        <div className="w-full mb-12 px-4">
          <CardTable onAddFavorite={handleAddFavorite} />
          <FavoriteHoReCa favorites={favorites} onRemoveFavorite={handleRemoveFavorite} />
        </div>
      </div>
    </>
  );
}
