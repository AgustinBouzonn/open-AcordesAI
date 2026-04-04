import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '../App';

const { authState, storageMock } = vi.hoisted(() => ({
  authState: {
  user: null as { username: string; email: string } | null,
  loading: false,
  login: vi.fn(),
  register: vi.fn(),
  loginWithOAuth: vi.fn(),
  completeOAuth: vi.fn(),
  logout: vi.fn(),
  updateProvider: vi.fn(),
  },
  storageMock: {
    getFavorites: vi.fn(),
    getHistory: vi.fn(),
    getPopularSongs: vi.fn(),
    getCommunitySongs: vi.fn(),
    searchSongs: vi.fn(),
    searchLocalSongs: vi.fn(),
    createSong: vi.fn(),
    getSong: vi.fn(),
    addToHistory: vi.fn(),
  },
}));

vi.mock('../components/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('../services/storageService', () => storageMock);

vi.mock('../components/SongViewer', () => ({
  SongViewer: ({ song }: { song: { title: string } }) => <div>SongViewer:{song.title}</div>,
}));

vi.mock('../components/CreateSongModal', () => ({
  CreateSongModal: () => null,
}));

vi.mock('../components/AddFromCommunityModal', () => ({
  AddFromCommunityModal: () => null,
}));

vi.mock('../components/ProfileModal', () => ({
  ProfileModal: () => null,
}));

describe('App', () => {
  beforeEach(() => {
    window.location.hash = '#/';
    authState.user = null;
    authState.loading = false;
    authState.login.mockReset();
    authState.register.mockReset();
    authState.loginWithOAuth.mockReset();
    authState.completeOAuth.mockReset().mockResolvedValue(undefined);
    authState.logout.mockReset();
    authState.updateProvider.mockReset();

    storageMock.getFavorites.mockReset().mockResolvedValue([]);
    storageMock.getHistory.mockReset().mockResolvedValue([]);
    storageMock.getPopularSongs.mockReset().mockResolvedValue([]);
    storageMock.getCommunitySongs.mockReset().mockResolvedValue([]);
    storageMock.searchSongs.mockReset().mockResolvedValue([]);
    storageMock.searchLocalSongs.mockReset().mockResolvedValue([]);
    storageMock.createSong.mockReset();
    storageMock.getSong.mockReset();
    storageMock.addToHistory.mockReset().mockResolvedValue(undefined);
  });

  it('loads song detail and records history', async () => {
    window.location.hash = '#/song/song-123';
    storageMock.getSong.mockResolvedValueOnce({ id: 'song-123', title: 'Wonderwall', artist: 'Oasis' });

    render(<App />);

    await waitFor(() => {
      expect(storageMock.getSong).toHaveBeenCalledWith('song-123');
      expect(storageMock.addToHistory).toHaveBeenCalledWith('song-123');
    });

    expect(await screen.findByText('SongViewer:Wonderwall')).toBeInTheDocument();
  });

  it('performs search and opens auth modal when anonymous user selects a result', async () => {
    const user = userEvent.setup();
    storageMock.searchSongs.mockResolvedValueOnce([{ id: 'itunes-1', title: 'Creep', artist: 'Radiohead' }]);
    storageMock.searchLocalSongs.mockResolvedValueOnce([{ id: 'local-1', title: 'Creep Acoustic', artist: 'Radiohead' }]);

    render(<App />);

    await user.type(screen.getByPlaceholderText('Canción o artista...'), 'creep');
    await user.keyboard('{Enter}');

    expect(await screen.findByText('Creep')).toBeInTheDocument();
    expect(await screen.findByText('Creep Acoustic')).toBeInTheDocument();

    await user.click(screen.getByText('Creep'));

    expect(storageMock.createSong).not.toHaveBeenCalled();
    expect(await screen.findByText('Iniciar Sesión')).toBeInTheDocument();
  });
});
