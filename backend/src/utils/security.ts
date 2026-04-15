export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';

  // Remove control characters except newlines and tabs
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Escape common prompt injection sequences
  sanitized = sanitized.replace(/```/g, '\\`\\`\\`');
  sanitized = sanitized.replace(/"""/g, '\\"\\"\\"');

  return sanitized;
};
