// ============================================================================
// services/import/import-validation.types.ts - Import-specific validation schemas
// ============================================================================

import { z } from 'zod';

// More lenient schemas specifically for CSV import validation
export const ResidentImportSchema = z.object({
  // Basic Information - more flexible for import
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  middle_name: z.string().optional().nullable(),
  suffix: z.string().optional().nullable(),
  birth_date: z.string().min(1, 'Birth date is required'),
  
  // Age - handle string input from CSV
  age: z.union([
    z.string().transform(val => {
      if (!val || val === '') return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    }),
    z.number(),
    z.null(),
    z.undefined()
  ]).optional(),
  
  birth_place: z.string().min(1, 'Birth place is required'),
  
  // Enums - accept strings and validate
  gender: z.string().optional(),
  civil_status: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  employment_status: z.string().optional(),
  educational_attainment: z.string().optional(),
  
  // Contact Information - all optional for import
  mobile_number: z.string().optional().nullable(),
  landline_number: z.string().optional().nullable(),
  email_address: z.string().optional().nullable(),

  // Address Information - make complete_address optional for import
  region: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  barangay: z.string().optional().nullable(),
  house_number: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  complete_address: z.string().optional().nullable(),
  
  // Family Information
  mother_name: z.string().optional().nullable(),
  father_name: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_number: z.string().optional().nullable(),
  emergency_contact_relationship: z.string().optional().nullable(),
  
  // Government IDs
  primary_id_type: z.string().optional().nullable(),
  id_number: z.string().optional().nullable(),
  philhealth_number: z.string().optional().nullable(),
  sss_number: z.string().optional().nullable(),
  tin_number: z.string().optional().nullable(),
  voters_id_number: z.string().optional().nullable(),
  voter_status: z.string().optional().nullable(),
  precinct_number: z.string().optional().nullable(),
  
  // Employment
  occupation: z.string().optional().nullable(),
  employer: z.string().optional().nullable(),
  monthly_income: z.string().optional().nullable(),
  
  // Health & Medical
  medical_conditions: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  
  // Special Classifications - handle string boolean values from CSV
  senior_citizen: z.union([
    z.string().transform(val => {
      if (!val || val === '') return false;
      return val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'yes';
    }),
    z.boolean(),
    z.null(),
    z.undefined()
  ]).optional(),
  
  person_with_disability: z.union([
    z.string().transform(val => {
      if (!val || val === '') return false;
      return val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'yes';
    }),
    z.boolean(),
    z.null(),
    z.undefined()
  ]).optional(),
  
  disability_type: z.string().optional().nullable(),
  
  indigenous_people: z.union([
    z.string().transform(val => {
      if (!val || val === '') return false;
      return val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'yes';
    }),
    z.boolean(),
    z.null(),
    z.undefined()
  ]).optional(),
  
  indigenous_group: z.string().optional().nullable(),
  
  four_ps_beneficiary: z.union([
    z.string().transform(val => {
      if (!val || val === '') return false;
      return val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'yes';
    }),
    z.boolean(),
    z.null(),
    z.undefined()
  ]).optional(),
  
  four_ps_household_id: z.string().optional().nullable(),
  profile_photo_url: z.string().optional().nullable(),
});

// Household Import Schema - more lenient for CSV
export const HouseholdImportSchema = z.object({
  // Basic Information
  household_number: z.string().min(1, 'Household number is required'),
  household_type: z.string().optional(),
  head_resident_id: z.string().optional().nullable(),
  
  // Address Information
  house_number: z.string().min(1, 'House number is required'),
  street_sitio: z.string().min(1, 'Street/Sitio is required'),
  barangay: z.string().min(1, 'Barangay is required'),
  complete_address: z.string().min(1, 'Complete address is required'),
  
  // Income Information
  monthly_income: z.string().optional().nullable(),
  primary_income_source: z.string().optional().nullable(),
  
  // Classifications - handle string boolean values
  four_ps_beneficiary: z.union([
    z.string().transform(val => {
      if (!val || val === '') return false;
      return val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'yes';
    }),
    z.boolean(),
    z.null(),
    z.undefined()
  ]).optional(),
  
  indigent_family: z.union([
    z.string().transform(val => {
      if (!val || val === '') return false;
      return val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'yes';
    }),
    z.boolean(),
    z.null(),
    z.undefined()
  ]).optional(),
  
  has_senior_citizen: z.union([
    z.string().transform(val => {
      if (!val || val === '') return false;
      return val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'yes';
    }),
    z.boolean(),
    z.null(),
    z.undefined()
  ]).optional(),
  
  has_pwd_member: z.union([
    z.string().transform(val => {
      if (!val || val === '') return false;
      return val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'yes';
    }),
    z.boolean(),
    z.null(),
    z.undefined()
  ]).optional(),
  
  // House Details
  house_type: z.string().optional().nullable(),
  ownership_status: z.string().optional().nullable(),
  
  // Utilities - handle string boolean values
  has_electricity: z.union([
    z.string().transform(val => {
      if (!val || val === '') return false;
      return val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'yes';
    }),
    z.boolean(),
    z.null(),
    z.undefined()
  ]).optional(),
  
  has_water_supply: z.union([
    z.string().transform(val => {
      if (!val || val === '') return false;
      return val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'yes';
    }),
    z.boolean(),
    z.null(),
    z.undefined()
  ]).optional(),
  
  has_internet_access: z.union([
    z.string().transform(val => {
      if (!val || val === '') return false;
      return val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'yes';
    }),
    z.boolean(),
    z.null(),
    z.undefined()
  ]).optional(),
  
  // Additional Information
  remarks: z.string().optional().nullable(),
});

// Updated validation code
export const validateImportRow = (row: any, type: 'RESIDENTS' | 'HOUSEHOLDS', rowNumber: number) => {
  try {
    if (type === 'RESIDENTS') {
      ResidentImportSchema.parse(row);
      return { isValid: true, errors: [] };
    } else {
      HouseholdImportSchema.parse(row);
      return { isValid: true, errors: [] };
    }
  } catch (validationError: any) {
    const errors: any[] = [];
    
    if (validationError.errors) {
      validationError.errors.forEach((err: any) => {
        errors.push({
          row: rowNumber,
          field: err.path.join('.'),
          message: err.message,
          value: row[err.path[0]]
        });
      });
    }
    
    return { isValid: false, errors };
  }
};

// Type exports
export type ResidentImportData = z.infer<typeof ResidentImportSchema>;
export type HouseholdImportData = z.infer<typeof HouseholdImportSchema>;