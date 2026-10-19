import { beforeEach, describe, expect, it, vi } from 'vitest';

const favorites = vi.hoisted(() => ({ add: vi.fn(), remove: vi.fn(), list: vi.fn() }));
vi.mock('../../services/apiClient', () => ({ api: { favorites } }));

import { toggleFavorite } from '../../services/storageService';

describe('toggleFavorite', () => {
  beforeEach(() => {
    favorites.add.mockReset().mockResolvedValue({ message: 'ok' });
    favorites.remove.mockReset().mockResolvedValue({ message: 'ok' });
  });

  it('adds when the song is not a favorite yet', async () => {
    await expect(toggleFavorite('7', false)).resolves.toBe(true);
    expect(favorites.add).toHaveBeenCalledWith('7');
    expect(favorites.remove).not.toHaveBeenCalled();
  });

  // Regresión: el POST es idempotente y siempre respondía OK, así que quitar un favorito no hacía nada.
  it('removes when the song already is a favorite', async () => {
    await expect(toggleFavorite('7', true)).resolves.toBe(false);
    expect(favorites.remove).toHaveBeenCalledWith('7');
    expect(favorites.add).not.toHaveBeenCalled();
  });

  it('propagates API errors so the caller keeps the previous state', async () => {
    favorites.remove.mockRejectedValue(new Error('offline'));
    await expect(toggleFavorite('7', true)).rejects.toThrow('offline');
  });
});
