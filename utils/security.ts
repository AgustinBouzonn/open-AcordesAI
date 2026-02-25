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
 * Prevents application crashes from malformed JSON in storage or API responses.
 */
export const safeJSONParse = <T>(jsonString: string | null | undefined, fallback: T): T => {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return fallback;
  }
};

/**
 * Safely writes to localStorage, catching QuotaExceededError and other storage errors.
 * Prevents application crashes when storage is full or disabled.
 */
export const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Check for quota exceeded error (names vary by browser)
    if (error instanceof Error &&
       (error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.warn("LocalStorage quota exceeded. Data not saved.", error);
      // Ideally show a toast to user, but for now we just prevent the crash
    } else {
      console.error("Error writing to localStorage:", error);
    }
  }
};
