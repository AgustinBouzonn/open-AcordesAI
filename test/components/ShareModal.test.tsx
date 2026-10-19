import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, vi } from 'vitest';
import { ShareModal } from '../../components/ShareModal';

describe('ShareModal', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('usa VITE_PUBLIC_APP_URL para el enlace, no el origen de la página', async () => {
    vi.stubEnv('VITE_PUBLIC_APP_URL', 'https://acordes.example');
    const user = userEvent.setup();
    const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText');
    render(<ShareModal isOpen onClose={vi.fn()} songId="song-789" />);

    await user.click(screen.getByRole('button', { name: /copiar enlace/i }));

    expect(clipboardSpy).toHaveBeenCalledWith('https://acordes.example/#/song/song-789');
  });

  it('copies the hash-based song URL', async () => {
    vi.stubEnv('VITE_PUBLIC_APP_URL', '');
    const user = userEvent.setup();
    const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText');
    render(<ShareModal isOpen onClose={vi.fn()} songId="song-123" />);

    await user.click(screen.getByRole('button', { name: /copiar enlace/i }));

    expect(clipboardSpy).toHaveBeenCalledWith(`${window.location.origin}/#/song/song-123`);
    expect(screen.getByText('Copiado!')).toBeInTheDocument();
  });

  it('opens WhatsApp share using the hash route', async () => {
    vi.stubEnv('VITE_PUBLIC_APP_URL', '');
    const user = userEvent.setup();
    render(<ShareModal isOpen onClose={vi.fn()} songId="song-456" />);

    await user.click(screen.getByRole('button', { name: /whatsapp/i }));

    expect(window.open).toHaveBeenCalledWith(
      `https://wa.me/?text=Mirá estos acordes: ${encodeURIComponent(`${window.location.origin}/#/song/song-456`)}`,
      '_blank'
    );
  });
});
