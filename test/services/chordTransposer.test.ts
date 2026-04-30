import { describe, it, expect } from 'vitest';
import { transposeChords, transposeChordToken, transposeRoot, isChordLine, extractUniqueChords } from '../../services/chordTransposer';

describe('chordTransposer', () => {
  it('transposeRoot wraps modulo 12', () => {
    expect(transposeRoot('C', 1)).toBe('C#');
    expect(transposeRoot('B', 1)).toBe('C');
    expect(transposeRoot('C', -1)).toBe('B');
    expect(transposeRoot('C', 12)).toBe('C');
  });

  it('transposeRoot normalizes B# and E#', () => {
    expect(transposeRoot('B#', 0)).toBe('C');
    expect(transposeRoot('E#', 0)).toBe('F');
  });

  it('transposeRoot handles flats', () => {
    expect(transposeRoot('Bb', 1)).toBe('B');
    expect(transposeRoot('Db', 0)).toBe('C#');
  });

  it('transposeChordToken keeps suffix and bass', () => {
    expect(transposeChordToken('Am', 2)).toBe('Bm');
    expect(transposeChordToken('Cmaj7', 2)).toBe('Dmaj7');
    expect(transposeChordToken('G/B', 2)).toBe('A/C#');
  });

  it('transposeChords with steps=0 returns original', () => {
    const text = 'C G Am F\nLetra de canción';
    expect(transposeChords(text, 0)).toBe(text);
  });

  it('transposeChords transposes only chord lines', () => {
    const input = 'C       G\nLetra de la canción\nAm      F';
    const out = transposeChords(input, 2);
    expect(out).toContain('D');
    expect(out).toContain('A');
    expect(out).toContain('Letra de la canción');
  });

  it('isChordLine recognizes pure chord lines', () => {
    expect(isChordLine('C G Am F')).toBe(true);
    expect(isChordLine('Letra normal de la canción')).toBe(false);
    expect(isChordLine('')).toBe(false);
  });

  it('extractUniqueChords returns deduped sorted set', () => {
    const text = 'C G Am F\nLetra\nC G Am F';
    const chords = extractUniqueChords(text);
    expect(chords).toEqual(expect.arrayContaining(['C', 'G', 'Am', 'F']));
    expect(chords.length).toBe(4);
  });

  it('handles empty input', () => {
    expect(transposeChords('', 5)).toBe('');
  });
});
