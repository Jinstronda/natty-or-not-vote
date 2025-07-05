export const isValidUrl = (string: string): boolean => {
  if (!string) return false;
  
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    // If it doesn't start with http/https, try adding https://
    try {
      const url = new URL(`https://${string}`);
      return true;
    } catch {
      return false;
    }
  }
}; 