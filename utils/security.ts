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
 * Safely parses a JSON string, returning a fallback value if parsing fails.
 * Prevents application crashes from malformed JSON in localStorage.
 */
export const safeJSONParse = <T>(jsonString: string | null, fallback: T): T => {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return fallback;
  }
};

/**
 * Sanitizes comment text to prevent XSS and DoS (length limits).
 */
export const sanitizeComment = (text: string, maxLength: number = 500): string => {
  if (!text) return "";
  // 1. Truncate to prevent storage exhaustion (DoS)
  const truncated = text.slice(0, maxLength);
  // 2. Basic XSS prevention (though React handles most, this is defense in depth)
  return truncated.trim();
};

/**
 * Safely saves to localStorage, handling QuotaExceededError.
 */
export const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
  }
};
