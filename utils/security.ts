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
 * This prevents app crashes from corrupted localStorage data.
 */
export const safeJSONParse = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    console.warn("Error parsing JSON from storage:", e);
    return fallback;
  }
};

/**
 * Safely writes to localStorage, catching QuotaExceededError and others.
 * Returns true if successful, false otherwise.
 */
export const safeSetItem = (key: string, value: string): boolean => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error writing to localStorage:", e);
    // In a real app, we might want to clear old cache here if quota is full
    return false;
  }
};
