// components/Cards/CardFilter.js
import React from "react";

export default function CardFilter({ title, type, options, placeholder, onChange }) {
  const renderInput = () => {
    switch (type) {
      case "select":
        return (
          <select
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">All</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case "date":
        return (
          <input
            type="date"
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            onChange={(e) => onChange(e.target.value)}
          />
        );
      default:
        return (
          <input
            type="text"
            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 shadow-lg">
      <div className="rounded-t mb-0 px-4 py-3 border-0">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full px-4 max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-base text-blueGray-700">
              {title}
            </h3>
          </div>
        </div>
      </div>
      <div className="block w-full overflow-x-auto p-4">
        {renderInput()}
      </div>
    </div>
  );
}