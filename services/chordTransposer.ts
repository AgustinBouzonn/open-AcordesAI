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

// ⚡ Bolt: Use manual string indexing and tokenization to avoid slow array allocations and regex overhead.
export function isChordLine(line: string): boolean {
  let len = line.length;
  let p = 0;
  while (p < len && line.charCodeAt(p) <= 32) p++;
  if (p === len) return false;

  let totalTokens = 0;
  let chordTokens = 0;

  while (p < len) {
    let start = p;
    while (p < len && line.charCodeAt(p) > 32) p++;
    if (start < p) {
      totalTokens++;
      let tStart = start;
      let tEnd = p;
      while (tStart < tEnd && (line.charCodeAt(tStart) === 91 || line.charCodeAt(tStart) === 40)) tStart++;
      while (tEnd > tStart) {
        const c = line.charCodeAt(tEnd - 1);
        if (c === 93 || c === 41 || c === 46 || c === 44 || c === 59 || c === 58 || c === 33 || c === 63) {
          tEnd--;
        } else {
          break;
        }
      }
      if (tStart < tEnd) {
        if (CHORD_TOKEN.test(line.substring(tStart, tEnd))) {
          chordTokens++;
        }
      }
    }
    while (p < len && line.charCodeAt(p) <= 32) p++;
  }
  return totalTokens > 0 && chordTokens > 0 && chordTokens >= Math.ceil(totalTokens * 0.6);
}

export function transposeChords(text: string, steps: number): string {
  if (steps === 0 || !text) return text;

  let result = '';
  const len = text.length;
  let startIdx = 0;

  while (startIdx < len) {
    let nextIdx = text.indexOf('\n', startIdx);
    if (nextIdx === -1) nextIdx = len;

    let line = text.substring(startIdx, nextIdx);
    startIdx = nextIdx + 1;

    if (line.indexOf('[') !== -1) {
       line = line.replace(/\[([^\[\]]+)\]/g, (fullMatch, token) => {
         return CHORD_TOKEN.test(token) ? `[${transposeChordToken(token, steps)}]` : fullMatch;
       });
    }

    if (isChordLine(line)) {
      line = line.replace(
        /(^|\s)(?:\[|\()?([A-G](?:#|b)?[^\s\]]*(?:\/[A-G](?:#|b)?)?)(?:\]|\))?(?=\s|$)/gi,
        (match, leading) => {
          const candidate = match.slice(leading.length);
          const cleaned = candidate.replace(/^[[(]+|[\])]+$/g, '').replace(/[.,;:!?]+$/g, '');
          return CHORD_TOKEN.test(cleaned) ? `${leading}${transposeChordToken(candidate, steps)}` : match;
        }
      );
    }

    result += line + (nextIdx === len ? '' : '\n');
  }

  return result;
}

export function extractUniqueChords(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();
  const len = text.length;
  let startIdx = 0;

  while (startIdx < len) {
    let nextIdx = text.indexOf('\n', startIdx);
    if (nextIdx === -1) nextIdx = len;

    const line = text.substring(startIdx, nextIdx);
    startIdx = nextIdx + 1;

    if (!isChordLine(line)) continue;

    let p = 0;
    const lineLen = line.length;
    while (p < lineLen) {
      while (p < lineLen && line.charCodeAt(p) <= 32) p++;
      let tStart = p;
      while (p < lineLen && line.charCodeAt(p) > 32) p++;
      if (tStart < p) {
        let tEnd = p;
        while (tStart < tEnd && (line.charCodeAt(tStart) === 91 || line.charCodeAt(tStart) === 40)) tStart++;
        while (tEnd > tStart) {
          const c = line.charCodeAt(tEnd - 1);
          if (c === 93 || c === 41 || c === 46 || c === 44 || c === 59 || c === 58 || c === 33 || c === 63) {
            tEnd--;
          } else {
            break;
          }
        }

        if (tStart < tEnd) {
          const clean = line.substring(tStart, tEnd);
          if (CHORD_TOKEN.test(clean)) {
            found.add(clean);
          }
        }
      }
    }
  }
  return Array.from(found);
}
