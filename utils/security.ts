/**
 * Sanitizes input to prevent prompt injection and other security issues.
 * @param input The user input string.
 * @returns Sanitized string.
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return "";

  // 1. Trim whitespace
  let sanitized = input.trim();

  // 2. Limit length to prevent token exhaustion or DOS
  // 500 characters should be enough for song titles/artists/queries
  sanitized = sanitized.slice(0, 500);

  // 3. Remove potentially dangerous characters for LLM prompts
  // We remove double quotes and backticks to prevent breaking out of string literals in prompts
  // and remove angle brackets to prevent potential tag injection if prompts use XML structure.
  sanitized = sanitized.replace(/["`<>]/g, '');

  return sanitized;
};
