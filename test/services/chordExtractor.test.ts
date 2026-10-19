import { describe, expect, it } from 'vitest';
import { extractChords, isChordToken } from '../../services/chordExtractor';
import { transposeChords } from '../../services/chordTransposer';

describe('chord extraction', () => {
  it('recognizes Cifra Club and jazz notation', () => {
    for (const t of ['C7M', 'Bm7(b5)', 'D°', 'A7(9)', 'Cadd9', 'F#m7', 'Gsus4', 'E+', 'Bø', 'C/G', 'Ebm']) {
      expect(isChordToken(t), t).toBe(true);
    }
  });

  it('does not mistake Spanish words for chords', () => {
    for (const t of ['Dame', 'Amor', 'Do', 'Era', 'Bien', 'Fin']) expect(isChordToken(t), t).toBe(false);
  });

  it('extracts unique chords from chord lines only, without bass', () => {
    const sheet = ['Intro: ', '| Am  F | C/G G7M |  x2', 'Dame tu amor', 'D°   Bm7(b5)  E7(9)', 'Am'].join('\n');
    expect(extractChords(sheet)).toEqual(['Am', 'F', 'C', 'G7M', 'D°', 'Bm7(b5)', 'E7(9)']);
  });
});

describe('transposition with Cifra Club notation', () => {
  it('moves 7M, °, (b5) and (9) chords too', () => {
    expect(transposeChords('C7M  D°  Bm7(b5)  A7(9)', 2)).toBe('D7M  E°  C#m7(b5)  B7(9)');
  });

  it('leaves lyrics alone', () => {
    expect(transposeChords('Dame tu amor', 2)).toBe('Dame tu amor');
  });
});
