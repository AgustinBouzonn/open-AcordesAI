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
 * Prevents application crashes from malformed storage data or API responses.
 */
export const safeJSONParse = <T>(json: string | null, fallback: T): T => {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return fallback;
  }
};

/**
 * Safely saves to localStorage, catching QuotaExceededError and other storage issues.
 * Prevents application crashes when storage is full (DoS protection).
 */
export const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    if (error instanceof Error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.warn(`LocalStorage quota exceeded when saving key "${key}". Data not saved.`);
    } else {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }
};
