export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  let clean = input.replace(/[\x00-\x1F\x7F]/g, '');
  clean = clean.replace(/```/g, '\\`\\`\\`');
  clean = clean.replace(/"""/g, '\\"\\"\\"');
  return clean;
}

export function safeJSONParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
}
