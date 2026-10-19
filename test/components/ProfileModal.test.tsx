import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const logout = vi.fn();
const showToast = vi.fn();
const deleteAccount = vi.fn();

vi.mock('../../components/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, username: 'ana', email: 'ana@test.com' }, logout }),
}));
vi.mock('../../components/Toast', () => ({ useToast: () => ({ showToast }) }));
vi.mock('../../services/apiClient', () => ({
  api: {
    auth: { stats: vi.fn().mockResolvedValue({ songsCreated: 0, favorites: 0, views: 0 }), deleteAccount: (...a: unknown[]) => deleteAccount(...a) },
    backup: { export: vi.fn(), import: vi.fn() },
  },
}));

import { ProfileModal } from '../../components/ProfileModal';

describe('ProfileModal account deletion', () => {
  beforeEach(() => {
    logout.mockReset();
    deleteAccount.mockReset();
  });

  it('only deletes after typing ELIMINAR, then logs out', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    deleteAccount.mockResolvedValue({ message: 'Cuenta eliminada' });
    render(<ProfileModal isOpen onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Eliminar mi cuenta' }));
    const confirm = screen.getByRole('button', { name: 'Eliminar' });
    expect(confirm).toBeDisabled();

    await user.type(screen.getByLabelText('Escribí ELIMINAR para confirmar'), 'ELIMINAR');
    await user.click(confirm);

    expect(deleteAccount).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
