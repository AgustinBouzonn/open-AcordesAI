/**
 * Sanitizes user input to prevent prompt injection and ensures reasonable length.
 * Removes characters that might be used to confuse the LLM if necessary,
 * but primarily focuses on length and structure.
 */
export const sanitizeInput = (input: string, maxLength: number = 100): string => {
  if (!input) return "";

  // Truncate to max length to prevent token exhaustion or long-winded injections
  let sanitized = input.slice(0, maxLength);

  // Check for common prompt injection patterns
  const lowerInput = sanitized.toLowerCase();
  const blocklistedPhrases = [
    'system prompt',
    'ignore instructions',
    'ignore previous',
    'disregard previous',
    'you are now',
    'forget previous',
    'act as a',
    'override',
    'bypass'
  ];

  for (const phrase of blocklistedPhrases) {
    if (lowerInput.includes(phrase)) {
      return '[REDACTED]';
    }
  }

  // Remove potential control characters and structural delimiters
  // Removing quotes, backticks to prevent breaking out of the prompt delimiter
  // Removing backslashes to prevent escape sequences
  // Removing newlines and tabs to disrupt structural injection
  sanitized = sanitized.replace(/["\\`\n\r\t]/g, ' ');

  return sanitized.trim();
};
