import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AuthModal } from '../../components/AuthModal';

const authMock = {
  login: vi.fn(),
  register: vi.fn(),
};

vi.mock('../../components/AuthContext', () => ({
  useAuth: () => authMock,
}));

describe('AuthModal', () => {
  beforeEach(() => {
    authMock.login.mockReset();
    authMock.register.mockReset();
  });

  it('submits login credentials', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<AuthModal isOpen mode="login" onClose={onClose} />);

    await user.type(screen.getByPlaceholderText('Email'), 'user@test.com');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(authMock.login).toHaveBeenCalledWith('user@test.com', 'secret123');
    expect(onClose).toHaveBeenCalled();
  });

  it('switches to register mode and submits username', async () => {
    const user = userEvent.setup();

    render(<AuthModal isOpen mode="login" onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Regístrate' }));
    expect(screen.getByPlaceholderText('Usuario')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Usuario'), 'nuevo');
    await user.type(screen.getByPlaceholderText('Email'), 'nuevo@test.com');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Registrarse' }));

    expect(authMock.register).toHaveBeenCalledWith('nuevo', 'nuevo@test.com', 'secret123');
  });
});
