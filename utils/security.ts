/**
 * Sanitizes user input to prevent prompt injection and ensures reasonable length.
 * Removes characters that might be used to confuse the LLM if necessary,
 * but primarily focuses on length and structure.
 */
export const sanitizeInput = (input: string, maxLength: number = 100): string => {
  if (!input) return "";

  // Truncate to max length to prevent token exhaustion or long-winded injections
  let sanitized = input.slice(0, maxLength);

  // Check for blocklisted keywords to prevent prompt injection
  const lowerInput = sanitized.toLowerCase();
  if (lowerInput.includes('system prompt') || lowerInput.includes('ignore instructions')) {
    return "[REDACTED]";
  }

  // Remove potential control characters (basic sanitization)
  // Removing quotes, backticks to prevent breaking out of the prompt delimiter
  // Removing backslashes to prevent escape sequences
  // Removing newlines and tabs
  sanitized = sanitized.replace(/["\\`\n\t]/g, '');

  return sanitized.trim();
};
