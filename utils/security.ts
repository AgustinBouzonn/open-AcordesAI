/**
 * Sanitizes user input to prevent prompt injection and ensures reasonable length.
 * Removes characters that might be used to confuse the LLM if necessary,
 * but primarily focuses on length and structure.
 */
export const sanitizeInput = (input: string, maxLength: number = 100): string => {
  if (!input) return "";

  // Truncate to max length to prevent token exhaustion or long-winded injections
  let sanitized = input.slice(0, maxLength);

  // Blocklist of common prompt injection phrases
  const lowerInput = sanitized.toLowerCase();
  const blocklist = ['system prompt', 'ignore instructions', 'ignore previous'];
  if (blocklist.some(keyword => lowerInput.includes(keyword))) {
    return "[REDACTED]";
  }

  // Remove potential control characters (basic sanitization)
  // Removing quotes to prevent breaking out of the prompt delimiter
  // Removing backslashes to prevent escape sequences
  // Removing backticks, newlines, and tabs
  sanitized = sanitized.replace(/["\\`\n\r\t]/g, '');

  return sanitized.trim();
};
