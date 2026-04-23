export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .replace(/"{3,}/g, '""') // Prevent breaking out of """ delimiters
    .substring(0, 500); // Limit string length to prevent oversized prompts
}
