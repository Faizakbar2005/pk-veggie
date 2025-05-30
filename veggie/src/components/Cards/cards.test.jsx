import { render, screen, fireEvent } from '@testing-library/react';
import Cards from './index';  // sesuaikan kalau komponen utama bernama lain, misal Cards.jsx

test('menampilkan tombol Detail di Cards', () => {
  render(<Cards title="Sayuran Segar" onDetailClick={() => {}} />);
  expect(screen.getByText('Detail')).toBeInTheDocument();
});

test('memanggil fungsi onDetailClick saat tombol Detail diklik', () => {
  const handleClick = jest.fn();
  render(<Cards title="Sayuran Segar" onDetailClick={handleClick} />);
  fireEvent.click(screen.getByText('Detail'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
