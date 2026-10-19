// Separadores que aparecen en las líneas de acordes y no son acordes: "| C G |", "x2", "-".
const FILLER_RE = /^(?:\|+|-+|x\d+|\(x\d+\)|%|\/)$/i;
// Lo que puede seguir a la nota: sufijos conocidos más números, alteraciones y paréntesis
// ("m7(b5)", "7M", "sus4", "add9", "°", "7(9)"). Así "Dame" o "Amor" no cuentan como acordes.
const QUALITY_WORDS_RE = /maj|min|dim|aug|sus|add|m|M/g;
const QUALITY_REST_RE = /^[\d#b()+\-°ºøΔ]*$/;

export function isChordToken(token: string): boolean {
  const match = token.match(/^([A-G][#b]?)([^/]*)(?:\/[A-G][#b]?)?$/);
  if (!match) return false;
  return QUALITY_REST_RE.test(match[2].replace(QUALITY_WORDS_RE, ''));
}

/** Acordes distintos de un cifrado, en orden de aparición y sin el bajo ("C/G" → "C"). */
export function extractChords(text: string): string[] {
  if (!text) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of text.split('\n')) {
    const tokens = line
      .trim()
      .split(/\s+/)
      .filter((t) => t && !FILLER_RE.test(t))
      .map((t) => t.replace(/^\[(.*)\]$/, '$1').replace(/^\((.*)\)$/, '$1'));
    if (tokens.length === 0 || !tokens.every(isChordToken)) continue;
    for (const token of tokens) {
      const base = token.split('/')[0];
      if (!seen.has(base)) {
        seen.add(base);
        result.push(base);
      }
    }
  }
  return result;
}
