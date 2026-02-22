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
 * Safely parses a JSON string, returning a fallback value on error.
 * Prevents application crashes from malformed storage data.
 */
export const safeJSONParse = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Failed to parse JSON from storage, using fallback:", error);
    return fallback;
  }
};

/**
 * Safely writes to localStorage, catching quota errors to prevent crashes.
 */
export const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Check for QuotaExceededError specifically if needed, but general catch is safer
    if (error instanceof Error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.error(`Storage quota exceeded when saving "${key}". Data not saved.`);
    } else {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }
};
