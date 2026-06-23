export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/```/g, '\\`\\`\\`') // Escape triple backticks
    .replace(/"""/g, '\\"\\"\\"'); // Escape triple quotes
}

export function safeJSONParse<T>(input: string, fallback: T): T {
  try {
    return JSON.parse(input) as T;
  } catch {
    return fallback;
  }
}
