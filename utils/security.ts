/**
 * Sanitizes user input to prevent prompt injection and ensures reasonable length.
 * Removes characters that might be used to confuse the LLM if necessary,
 * but primarily focuses on length and structure.
 */
/**
 * Safely parses a JSON string, returning a fallback value if parsing fails.
 * Protects against application crashes from corrupted data or malformed AI responses.
 */
export const safeJSONParse = <T>(data: string | null | undefined, fallback: T): T => {
  if (!data) return fallback;
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return fallback;
  }
};

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
