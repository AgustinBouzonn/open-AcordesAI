/**
 * Sanitizes user input to prevent prompt injection and ensures reasonable length.
 * Removes characters that might be used to confuse the LLM if necessary,
 * but primarily focuses on length and structure.
 */
export const sanitizeInput = (input: string, maxLength: number = 100): string => {
  if (!input) return "";

  // Check for common prompt injection keywords
  const lowerInput = input.toLowerCase();
  const blocklistedKeywords = ['system prompt', 'ignore instructions', 'forget instructions', 'ignore previous'];
  if (blocklistedKeywords.some(keyword => lowerInput.includes(keyword))) {
    return "[REDACTED]";
  }

  // Truncate to max length to prevent token exhaustion or long-winded injections
  let sanitized = input.slice(0, maxLength);

  // Remove potential control characters (basic sanitization)
  // Removing quotes to prevent breaking out of the prompt delimiter
  // Removing backslashes to prevent escape sequences
  // Removing backticks, newlines, and tabs
  sanitized = sanitized.replace(/["\\`\n\t]/g, '');

  return sanitized.trim();
};
