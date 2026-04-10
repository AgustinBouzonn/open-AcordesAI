export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  // Remove markdown and control characters, leaving only basic text
  return input.replace(/[`"'{}<>]/g, '').trim().substring(0, 100);
};
