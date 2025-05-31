import { render, screen, fireEvent } from '@testing-library/react';
import Button from './button';

test('menampilkan teks tombol dengan benar', () => {
  render(<Button>Click Me</Button>);
  expect(screen.getByText('Click Me')).toBeInTheDocument();
});

test('memanggil fungsi onClick saat diklik', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  fireEvent.click(screen.getByText('Click'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
