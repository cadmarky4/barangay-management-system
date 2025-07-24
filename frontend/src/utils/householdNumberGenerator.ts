// ============================================================================
// utils/householdNumberGenerator.ts - Frontend household number generation
// ============================================================================

/**
 * Generate a random household number on the frontend side
 * Format: HH-YYYY-XXXXXXXX (where X is a random alphanumeric string)
 * Following the principle that frontend is the source of truth
 */
export function generateHouseholdNumber(): string {
  const prefix = 'HH';
  const year = new Date().getFullYear();
  
  // Generate 8-character random alphanumeric string (uppercase letters and numbers)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  
  for (let i = 0; i < 8; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${prefix}-${year}-${randomString}`;
}

/**
 * Validate household number format
 * @param householdNumber - The household number to validate
 * @returns boolean indicating if the format is valid
 */
export function isValidHouseholdNumberFormat(householdNumber: string): boolean {
  // Pattern: HH-YYYY-XXXXXXXX
  const pattern = /^HH-\d{4}-[A-Z0-9]{8}$/;
  return pattern.test(householdNumber);
}

/**
 * Extract year from household number
 * @param householdNumber - The household number
 * @returns year or null if invalid format
 */
export function extractYearFromHouseholdNumber(householdNumber: string): number | null {
  if (!isValidHouseholdNumberFormat(householdNumber)) {
    return null;
  }
  
  const yearPart = householdNumber.split('-')[1];
  return parseInt(yearPart, 10);
}
