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
 * Prevents application crashes from corrupted local storage data.
 */
export const safeJSONParse = <T>(jsonString: string | null, fallback: T): T => {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Error parsing JSON from storage:", error);
    return fallback;
  }
};

/**
 * Safely sets an item in localStorage, catching QuotaExceededError.
 * Prevents application crashes when storage is full (DoS protection).
 */
export const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    // Check for quota exceeded error names (different browsers use different names)
    if (error instanceof Error &&
       (error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        error.name === 'QuotaExceededERR')) {
      console.warn(`Storage quota exceeded for key "${key}". Data was not saved.`);
    } else {
      console.error(`Error saving to localStorage for key "${key}":`, error);
    }
    return false;
  }
};
