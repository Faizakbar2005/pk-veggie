// src/components/FormInput.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import FormInput from './FormInput';

test('input bisa diisi dan submit memanggil onSubmit dengan value yang benar', () => {
  const mockOnSubmit = jest.fn();

  render(<FormInput onSubmit={mockOnSubmit} />);

  // cari input dan tombol submit
  const input = screen.getByTestId('input-text');
  const button = screen.getByRole('button', { name: /submit/i });

  // isi input dengan "Halo"
  fireEvent.change(input, { target: { value: 'Halo' } });
  expect(input.value).toBe('Halo');

  // klik submit
  fireEvent.click(button);

  // cek mockOnSubmit dipanggil sekali dengan argument "Halo"
  expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  expect(mockOnSubmit).toHaveBeenCalledWith('Halo');
});
