// src/components/FormInput.jsx
import React, { useState } from 'react';

export default function FormInput({ onSubmit }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Masukkan sesuatu..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        data-testid="input-text"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
