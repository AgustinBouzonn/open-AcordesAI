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
 * Safely parses JSON strings without throwing exceptions.
 * Returns the provided fallback value if parsing fails.
 * Helps prevent DoS via corrupted localStorage or malformed API responses.
 */
export function safeJSONParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Failed to parse JSON safely:", error);
    return fallback;
  }
}
