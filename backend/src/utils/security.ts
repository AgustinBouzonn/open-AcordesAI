export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';

  // Remove control characters except newline and tab
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Escape potential prompt injection delimiters
  sanitized = sanitized.replace(/```/g, '\\`\\`\\`');
  sanitized = sanitized.replace(/"""/g, '\\"\\"\\"');

  return sanitized.trim();
};

export const safeJSONParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('[security] safeJSONParse failed', error);
    return fallback;
  }
};
