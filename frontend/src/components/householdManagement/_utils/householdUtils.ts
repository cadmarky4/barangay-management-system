// ============================================================================
// utils/householdUtils.ts - Utility functions for household data
// ============================================================================

import type { Household } from '@/services/households/households.types';

/**
 * Get household programs based on classifications
 */
export const getHouseholdPrograms = (household: Household): string[] => {
  const programs = [];
  
  if (household.four_ps_beneficiary) programs.push("4Ps");
  if (household.has_senior_citizen) programs.push("Senior Citizen");
  if (household.indigent_family) programs.push("Indigent Family");
  if (household.has_pwd_member) programs.push("PWD Support");
  
  return programs;
};

/**
 * Format income range for display
 */
export const formatIncomeRange = (incomeRange: string): string => {
  const formatMap: Record<string, string> = {
    'BELOW_10000': 'Below ₱10,000',
    'RANGE_10000_25000': '₱10,000 - ₱25,000',
    'RANGE_25000_50000': '₱25,000 - ₱50,000',
    'RANGE_50000_100000': '₱50,000 - ₱100,000',
    'ABOVE_100000': 'Above ₱100,000',
  };
  
  return formatMap[incomeRange] || incomeRange;
};

/**
 * Get badge color for program classification
 */
export const getProgramBadgeColor = (program: string): string => {
  switch (program) {
    case '4Ps':
      return 'bg-green-100 text-green-800';
    case 'Senior Citizen':
      return 'bg-blue-100 text-blue-800';
    case 'Indigent Family':
      return 'bg-yellow-100 text-yellow-800';
    case 'PWD Support':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Format household type for display
 */
export const formatHouseholdType = (type: string): string => {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase());
};

/**
 * Format ownership status for display
 */
export const formatOwnershipStatus = (status: string): string => {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase());
};