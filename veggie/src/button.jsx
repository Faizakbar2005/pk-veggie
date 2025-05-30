// src/components/Button.jsx
export default function Button({ onClick, children }) {
  return (
    <button
      className="bg-green-500 text-white px-4 py-2 rounded"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
