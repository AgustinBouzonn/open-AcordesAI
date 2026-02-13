/**
 * Sanitizes user input to prevent prompt injection and ensures reasonable length.
 * Removes characters that might be used to confuse the LLM if necessary,
 * but primarily focuses on length and structure.
 */
export const sanitizeInput = (input: string, maxLength: number = 100): string => {
  if (!input) return "";

  // Truncate to max length to prevent token exhaustion or long-winded injections
  let sanitized = input.slice(0, maxLength);

  // Remove potential control characters (basic sanitization)
  // Removing quotes to prevent breaking out of the prompt delimiter
  // Removing backslashes to prevent escape sequences
  sanitized = sanitized.replace(/["\\]/g, '');

  return sanitized.trim();
};

/**
 * Sanitizes user comments to prevent DoS via large payloads.
 * Enforces strict length limits but preserves punctuation for readability.
 */
export const sanitizeComment = (input: string, maxLength: number = 500): string => {
  if (!input) return "";

  // Truncate to max length
  let sanitized = input.slice(0, maxLength);

  // Trim whitespace
  return sanitized.trim();
};
