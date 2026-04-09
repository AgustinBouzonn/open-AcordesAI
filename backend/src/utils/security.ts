export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/"""/g, '') // Remove triple quotes completely to prevent delimiter breakout
    .trim();
}
