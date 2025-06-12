
// Phone validation and formatting utilities
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  
  // Remove all non-digit characters for validation
  const digits = phone.replace(/\D/g, '');
  
  // Check various valid formats
  const patterns = [
    /^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$/, // US format
    /^\+?[1-9]\d{1,14}$/ // International format (E.164)
  ];
  
  return patterns.some(pattern => pattern.test(digits)) && digits.length >= 10;
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as US phone number if it looks like one
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  return phone; // Return original if we can't format it
};
