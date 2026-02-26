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
 * This prevents crashes due to malformed JSON in storage or API responses.
 */
export const safeJSONParse = <T>(jsonString: string | null | undefined, fallback: T): T => {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn("safeJSONParse: Failed to parse JSON, using fallback:", error);
    return fallback;
  }
};

/**
 * Safely sets an item in localStorage, catching QuotaExceededError.
 * This prevents the application from crashing when storage is full.
 */
export const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error: any) {
    // Check for quota exceeded error (names vary by browser)
    if (
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        (error.message && error.message.includes('quota'))
    ) {
        console.error("safeSetItem: LocalStorage quota exceeded. Data not saved.");
    } else {
        console.error("safeSetItem: Error saving to localStorage:", error);
    }
  }
};
