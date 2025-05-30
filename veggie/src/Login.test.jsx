// src/Login.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';

test('form login input dan submit memanggil onLogin dengan data benar', () => {
  const mockOnLogin = jest.fn();

  render(<Login onLogin={mockOnLogin} />);

  const emailInput = screen.getByTestId('input-email');
  const passwordInput = screen.getByTestId('input-password');
  const button = screen.getByRole('button', { name: /login/i });

  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'secret123' } });

  expect(emailInput.value).toBe('test@example.com');
  expect(passwordInput.value).toBe('secret123');

  fireEvent.click(button);

  expect(mockOnLogin).toHaveBeenCalledTimes(1);
  expect(mockOnLogin).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'secret123',
  });
});
