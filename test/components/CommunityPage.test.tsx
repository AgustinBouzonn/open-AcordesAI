import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CommunityPage } from '../../components/pages/CommunityPage';
import type { Song } from '../../types';

const base = { loading: false, page: 0, onPageChange: vi.fn(), onSelectSong: vi.fn(), onNewClick: vi.fn(), onSearchClick: vi.fn() };
const song = (id: string, rating: unknown): Song => ({ id, title: `Canción ${id}`, artist: 'Banda', rating } as unknown as Song);

describe('CommunityPage ratings', () => {
  it('rounds the average that Postgres returns as a long numeric string', () => {
    render(<CommunityPage {...base} songs={[song('1', '5.0000000000000000')]} />);
    expect(screen.getByText('5.0')).toBeInTheDocument();
    expect(screen.queryByText('5.0000000000000000')).not.toBeInTheDocument();
  });

  it('hides the star for unrated songs (rating "0")', () => {
    render(<CommunityPage {...base} songs={[song('2', '0')]} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
