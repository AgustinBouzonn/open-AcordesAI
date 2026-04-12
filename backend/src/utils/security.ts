export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/```/g, '\\`\\`\\`')
    .replace(/"""/g, '\\"\\"\\"');
}

export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
