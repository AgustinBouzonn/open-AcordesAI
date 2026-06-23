/**
 * Sanitizes user input to prevent prompt injection and control character anomalies.
 * It removes control characters and escapes quotes/backslashes to ensure safe interpolation.
 */
export const sanitizeInput = (input: unknown): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // 1. Remove non-printable control characters except standard whitespace
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Escape triple quotes and similar constructs that could break out of a delimited string block
  sanitized = sanitized.replace(/"""/g, '"\\"\\"');
  sanitized = sanitized.replace(/```/g, '\\`\\`\\`');

  // 3. Limit length to prevent massive token usage or complex injection attempts
  return sanitized.slice(0, 300).trim();
};

/**
 * Parses JSON safely without throwing runtime errors that could crash the application.
 */
export const safeJSONParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
};
