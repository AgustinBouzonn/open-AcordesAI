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
 * Safely parses JSON content, returning a fallback value if parsing fails.
 * Protects against application crashes due to malformed storage data.
 */
export const safeJSONParse = <T>(jsonString: string | null, fallback: T): T => {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn("Error parsing JSON from storage, using fallback:", error);
    return fallback;
  }
};

/**
 * Safely sets an item in localStorage, catching QuotaExceededError.
 * Prevents application crashes when storage is full (DoS protection).
 */
export const safeSetItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (error: any) {
    if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn(`LocalStorage quota exceeded. Failed to save key "${key}".`);
      // Optional: Implement cache eviction strategy here in the future
    } else {
      console.error(`Error saving to LocalStorage key "${key}":`, error);
    }
  }
};
