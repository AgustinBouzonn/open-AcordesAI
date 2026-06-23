export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';

  // Remove control characters except newline and tab
  let clean = input.replace(/[\x00-\x08\x0B-\x1F\x7F-\x9F]/g, '');

  // Escape potential prompt injection delimiters
  clean = clean.replace(/```/g, '\\`\\`\\`');
  clean = clean.replace(/"""/g, '\\"\\"\\"');

  return clean;
};

export const safeJSONParse = <T>(jsonString: string, fallback: T): T => {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed !== null && typeof parsed === 'object' ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
};
