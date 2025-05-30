// veggie/src/components/Cards/index.jsx
import React from 'react';

export default function Cards({ title, onDetailClick }) {
  return (
    <div className="card p-4 border rounded shadow">
      <h2>{title}</h2>
      <button 
        onClick={onDetailClick} 
        className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Detail
      </button>
    </div>
  );
}
