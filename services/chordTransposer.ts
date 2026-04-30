const TRANSPOSITIONS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_TO_SHARP: Record<string, string> = {
  Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#',
};
export const CHORD_TOKEN = /^[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add)?\d*(?:[#b](?:5|9|11|13))*(?:\/[A-G](?:#|b)?)?$/i;

export function transposeRoot(root: string, steps: number): string {
  if (!root) return root;
  const letter = root[0]?.toUpperCase();
  const accidental = root[1] === '#' ? '#' : root[1] === 'b' ? 'b' : '';
  let canonical = `${letter}${accidental}`;
  if (canonical === 'B#') canonical = 'C';
  else if (canonical === 'E#') canonical = 'F';
  else if (canonical === 'Cb') canonical = 'B';
  else if (canonical === 'Fb') canonical = 'E';
  else if (FLAT_TO_SHARP[canonical]) canonical = FLAT_TO_SHARP[canonical];

  const idx = TRANSPOSITIONS.indexOf(canonical);
  if (idx === -1) return root;
  return TRANSPOSITIONS[(idx + steps + 12) % 12];
}

export function transposeChordToken(token: string, steps: number): string {
  const match = token.match(/^(\[|\()?([A-G](?:#|b)?)(.*?)(?:\/([A-G](?:#|b)?))?(\]|\))?$/i);
  if (!match) return token;
  const [, prefix, root, suffixWithoutBass, bass, closing] = match;
  const normalizedSuffix = bass ? suffixWithoutBass.replace(/\/$/, '') : suffixWithoutBass;
  const transposedBass = bass ? `/${transposeRoot(bass, steps)}` : '';
  return `${prefix ?? ''}${transposeRoot(root, steps)}${normalizedSuffix ?? ''}${transposedBass}${closing ?? ''}`;
}

export function isChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  const chordTokens = tokens.filter((token) => {
    const cleaned = token.replace(/^[\[(]+|[\])]+$/g, '').replace(/[.,;:!?]+$/g, '');
    return CHORD_TOKEN.test(cleaned);
  });
  return chordTokens.length > 0 && chordTokens.length >= Math.ceil(tokens.length * 0.6);
}

export function transposeChords(text: string, steps: number): string {
  if (steps === 0 || !text) return text;
  return text
    .split('\n')
    .map((line) => {
      const withInlineChords = line.replace(/\[([^[\]]+)\]/g, (fullMatch, token: string) => {
        return CHORD_TOKEN.test(token) ? `[${transposeChordToken(token, steps)}]` : fullMatch;
      });
      if (!isChordLine(withInlineChords)) return withInlineChords;
      return withInlineChords.replace(
        /(^|\s)(?:\[|\()?([A-G](?:#|b)?[^\s\]]*(?:\/[A-G](?:#|b)?)?)(?:\]|\))?(?=\s|$)/gi,
        (match, leading) => {
          const candidate = match.slice(leading.length);
          const cleaned = candidate.replace(/^[\[(]+|[\])]+$/g, '').replace(/[.,;:!?]+$/g, '');
          return CHORD_TOKEN.test(cleaned) ? `${leading}${transposeChordToken(candidate, steps)}` : match;
        },
      );
    })
    .join('\n');
}

export function extractUniqueChords(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();
  for (const line of text.split('\n')) {
    if (!isChordLine(line)) continue;
    for (const raw of line.split(/\s+/)) {
      const cleaned = raw.replace(/^[\[(]+|[\])]+$/g, '').replace(/[.,;:!?]+$/g, '');
      if (CHORD_TOKEN.test(cleaned)) found.add(cleaned);
    }
  }
  return Array.from(found);
}
