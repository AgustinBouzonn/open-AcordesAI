export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/```/g, '\\`\\`\\`') // Escape markdown code blocks
    .replace(/"""/g, '\\"\\"\\"'); // Escape triple quotes
};

export const safeJSONParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error('[safeJSONParse] Failed to parse JSON:', e);
    return fallback;
  }
};
