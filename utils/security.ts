/**
 * Security utilities for input sanitization and validation.
 */

/**
 * Sanitizes user input to prevent prompt injection and other security risks in LLM contexts.
 *
 * - Trims whitespace
 * - Normalizes whitespace (removes newlines/tabs)
 * - Limits length to 100 characters (reasonable for song/artist search)
 * - Escapes double quotes (since prompts use double quotes)
 * - Removes potential control characters or dangerous symbols (< > { } [ ])
 *
 * @param input The raw user input
 * @returns The sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return "";

  // 1. Trim whitespace
  let sanitized = input.trim();

  // 2. Limit length to prevent DoS or token limit issues
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }

  // 3. Normalize whitespace (replace newlines/tabs with space)
  sanitized = sanitized.replace(/\s+/g, " ");

  // 4. Escape/Remove quotes to prevent breaking out of string context in prompt
  // The prompt uses double quotes: "${query}"
  sanitized = sanitized.replace(/"/g, "'");

  // 5. Remove potentially dangerous characters commonly used in prompt injection
  // < > { } [ ]
  sanitized = sanitized.replace(/[<>{}\[\]]/g, "");

  return sanitized;
};
