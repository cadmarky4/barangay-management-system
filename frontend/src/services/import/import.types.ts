// ============================================================================
// services/import/import.types.ts - Import Zod schemas and type definitions
// ============================================================================

import { z } from 'zod';
import { CivilStatusSchema, EducationalAttainmentSchema, EmploymentStatusSchema, GenderSchema, NationalitySchema, ReligionSchema, VoterStatusSchema } from '../residents/residents.types';

export const ResidentFormDataSchema = z.object({
  // Basic Information
  first_name: z.string().min(1, 'residents.form.error.firstNameRequired'),
  last_name: z.string().min(1, 'residents.form.error.lastNameRequired'),
  middle_name: z.string().optional(),
  suffix: z.string().optional(),
  birth_date: z.string().min(1, 'residents.form.error.birthDateRequired'),
    age: z.union([
        z.number().int().min(0, 'Age must be a positive integer'),
        z.string().transform(val => {
        const num = Number(val);
        return isNaN(num) ? null : num;
        }).optional(),
        z.null(),
        z.undefined()
]).optional(),
  birth_place: z.string().min(1, 'residents.form.error.birthPlaceRequired'),

  gender: GenderSchema,
  civil_status: CivilStatusSchema,
  nationality: NationalitySchema,
  religion: ReligionSchema,
  employment_status: EmploymentStatusSchema,
  educational_attainment: EducationalAttainmentSchema,
  
  // Contact Information
  mobile_number: z.string().optional(),
  landline_number: z.string().optional(),
  email_address: z.union([z.string().email('Invalid email address'), z.literal('')]).optional(),

  // Address Information
  region: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  barangay: z.string().optional(),

  house_number: z.string().optional(),
  street: z.string().optional(),
  complete_address: z.string().min(1, 'Complete address is required'),
  
  // Family Information
  mother_name: z.string().optional(),
  father_name: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_number: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
  
  // Government IDs
  primary_id_type: z.string().optional(),
  id_number: z.string().optional(),
  philhealth_number: z.string().optional(),
  sss_number: z.string().optional(),
  tin_number: z.string().optional(),
  voters_id_number: z.string().optional(),
  voter_status: VoterStatusSchema,
  precinct_number: z.string().optional(),
  
  // Employment
  occupation: z.string().optional(),
  employer: z.string().optional(),
  monthly_income: z.string().optional(),
  
  // Health & Medical
  medical_conditions: z.string().optional(),
  allergies: z.string().optional(),
  
// Special Classifications - Make all optional
senior_citizen: z.coerce.boolean().optional(),
person_with_disability: z.coerce.boolean().optional(),
disability_type: z.string().nullable().optional(),
indigenous_people: z.coerce.boolean().optional(),
indigenous_group: z.string().nullable().optional(),
four_ps_beneficiary: z.coerce.boolean().optional(),
four_ps_household_id: z.string().nullable().optional(),
  // Profile photo
  profile_photo_url: z.string().optional(),
});

// Import validation schemas
export const ImportPreviewSchema = z.object({
  headers: z.array(z.string()),
  data: z.array(z.record(z.string(), z.any())),
  totalRows: z.number(),
  validRows: z.number(),
  invalidRows: z.number(),
  errors: z.array(z.object({
    row: z.number(),
    field: z.string(),
    message: z.string(),
    value: z.any()
  }))
});

export const ImportResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  imported: z.number(),
  failed: z.number(),
  errors: z.array(z.object({
    row: z.number(),
    field: z.string(),
    message: z.string()
  })).optional()
});

export const ImportHistoryItemSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  type: z.enum(['RESIDENTS', 'HOUSEHOLDS']),
  status: z.enum(['SUCCESS', 'FAILED', 'PARTIAL']),
  importedRows: z.number(),
  totalRows: z.number(),
  createdAt: z.string(),
  createdBy: z.string(),
  errors: z.array(z.string()).optional()
});

export const ImportParamsSchema = z.object({
  page: z.number().min(1).optional(),
  per_page: z.number().min(1).max(100).optional(),
  type: z.enum(['RESIDENTS', 'HOUSEHOLDS']).optional(),
});

// Type exports
export type ImportPreview = z.infer<typeof ImportPreviewSchema>;
export type ImportResult = z.infer<typeof ImportResultSchema>;
export type ImportHistoryItem = z.infer<typeof ImportHistoryItemSchema>;
export type ImportParams = z.infer<typeof ImportParamsSchema>;
export type ImportType = 'RESIDENTS' | 'HOUSEHOLDS';