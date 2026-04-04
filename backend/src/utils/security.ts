export function sanitizeInput(input: string): string {
  if (!input) return '';
  const truncated = input.slice(0, 200);
  const blocklist = ['system prompt', 'ignore instructions', 'ignore previous', 'system message'];
  for (const keyword of blocklist) {
    if (truncated.toLowerCase().includes(keyword)) {
      return '[REDACTED]';
    }
  }
  return truncated.replace(/[\"'\\`\n\t]/g, '');
}
