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
 * Safely parses a JSON string, returning a default value if parsing fails.
 * Helps prevent application crashes due to corrupted local storage or malformed AI responses.
 */
export const safeJSONParse = <T>(input: string | null | undefined, defaultValue: T): T => {
  if (!input) return defaultValue;
  try {
    return JSON.parse(input) as T;
  } catch (error) {
    console.error("SafeJSONParse: Failed to parse JSON string.", error);
    return defaultValue;
  }
};
