// ============================================================================
// types/barangayOfficials.ts - Zod schemas and type definitions
// ============================================================================

import { z } from 'zod';
import { GenderSchema, CivilStatusSchema, EducationalAttainmentSchema, NationalitySchema } from '../__shared/types';
import type { Resident } from '@/services/residents/residents.types';

// Enum schemas
export const OfficialPositionSchema = z.enum([
  'BARANGAY_CAPTAIN',
  'BARANGAY_SECRETARY',
  'BARANGAY_TREASURER',
  'KAGAWAD',
  'SK_CHAIRPERSON', 
  'SK_KAGAWAD', 
  'BARANGAY_CLERK', 
  'BARANGAY_TANOD',
]);

export const CommitteeAssignmentSchema = z.enum([
  'Health',
  'Education',
  'Public Safety',
  'Environment',
  'Peace and Order', 
  'Sports and Recreation',
  'Women and Family',
  'Senior Citizens',
]);

export const OfficialStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'RESIGNED',
  'TERMINATED',
  'DECEASED',
]);

export const PrefixSchema = z.enum([
  'Mr.',
  'Ms.',
  'Mrs.',
  'Dr.',
  'Hon.',
]);

// Basically without the computed fields and search param for forms
export const BarangayOfficialBaseSchema = z.object({
  // Foreign Key
  resident_id: z.string().uuid('barangayOfficials.form.validation.invalidUUID'),

  // Basic information
  prefix: PrefixSchema,
  first_name: z.string().min(1, 'barangayOfficials.form.validation.firstNameRequired'),
  middle_name: z.string().nullable().optional(),
  last_name: z.string().min(1, 'barangayOfficials.form.validation.lastNameRequired'),
  suffix: z.string().optional(),

  birth_date: z.string().min(1, 'barangayOfficials.form.validation.birthDateRequired'), 
  gender: GenderSchema,
  nationality: NationalitySchema.nullable().optional(),
  civil_status: CivilStatusSchema,
  educational_attainment: EducationalAttainmentSchema,

  // Contact Information
  mobile_number: z.string().optional(),
  email_address: z.union([z.string().email('barangayOfficials.form.validation.invalidEmailAddress'), z.literal('')]).optional(),

  // Address Information
  complete_address: z.string().min(1, 'barangayOfficials.form.validation.completeAddressRequired'),

  // Position Information
  position: OfficialPositionSchema,
  
  // committee_assignment: z.preprocess(
  //   (val) => val === '' ? undefined : val,
  //   CommitteeAssignmentSchema
  // ).refine(val => val !== undefined, {
  //   message: 'barangayOfficials.form.validation.committeeAssignmentRequired',
  // }),
  committee_assignment: CommitteeAssignmentSchema,

  // Term Information
  term_start: z.string().min(1, 'barangayOfficials.form.validation.termStartRequired'),
  term_end: z.string().min(1, 'barangayOfficials.form.validation.termEndRequired'),
  term_number: z.number().optional(),
  is_current_term: z.boolean().optional(),

  // Status
  status: OfficialStatusSchema,

  // System fields
  created_at: z.string(),
  updated_at: z.string(),

  // Profile photo
  profile_photo_url: z.string().nullable().optional(), 
})

// Form data schema - excludes system fields that are handled by backend
export const BarangayOfficialFormDataSchema = z.object({
  // Optional search field for forms
  resident_search: z.string().optional(),
  
  // Foreign Key
  resident_id: z.string().uuid('barangayOfficials.form.validation.invalidUUID'),

  // Basic information
  prefix: PrefixSchema,
  first_name: z.string().min(1, 'barangayOfficials.form.validation.firstNameRequired'),
  middle_name: z.string().nullable().optional(),
  last_name: z.string().min(1, 'barangayOfficials.form.validation.lastNameRequired'),
  suffix: z.string().optional(),

  birth_date: z.string().min(1, 'barangayOfficials.form.validation.birthDateRequired'), 
  gender: GenderSchema,
  nationality: NationalitySchema.nullable().optional(),
  civil_status: CivilStatusSchema,
  educational_attainment: EducationalAttainmentSchema,

  // Contact Information
  mobile_number: z.string().optional(),
  email_address: z.union([z.string().email('barangayOfficials.form.validation.invalidEmailAddress'), z.literal('')]).optional(),

  // Address Information
  complete_address: z.string().min(1, 'barangayOfficials.form.validation.completeAddressRequired'),

  // Position Information
  position: OfficialPositionSchema,
  committee_assignment: CommitteeAssignmentSchema.optional(),

  // Term Information
  term_start: z.string().min(1, 'barangayOfficials.form.validation.termStartRequired'),
  term_end: z.string().min(1, 'barangayOfficials.form.validation.termEndRequired'),
  term_number: z.number().optional(),
  is_current_term: z.boolean().optional(),

  // Status
  status: OfficialStatusSchema.optional().default('ACTIVE'),

  // Profile photo (optional for forms)
  profile_photo_url: z.string().nullable().optional(),
})

export const BarangayOfficialSchema = BarangayOfficialBaseSchema.extend({
  id: z.string().uuid(),
  
  // Computed attributes (can be added if needed)
  // full_name: z.string().optional(),
  // age: z.number().optional(),
  // term_duration: z.number().optional(),
  // days_in_office: z.number().optional(),
  // is_term_ending_soon: z.boolean().optional(),
})

// Query parameters schema
export const BarangayOfficialParamsSchema = z.object({
  page: z.number().min(1).optional(),
  position: OfficialPositionSchema.optional(),
  committee: CommitteeAssignmentSchema.optional(),
  status: OfficialStatusSchema.optional(),
  is_active: z.boolean().optional(),
  current_term: z.boolean().optional(),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  per_page: z.number().optional()
});

export const BarangayOfficialStatisticsSchema = z.object({
  total_officials: z.number(),
  active_officials: z.number(),
  current_term_officials: z.record(z.string(), z.number()),
  by_gender: z.record(z.string(), z.number()),
  average_performance: z.number(),
  average_tenure: z.number(),
  upcoming_term_endings: z.number()
});


//BAND AID SOLUTION
export function transformBarangayOfficialToFormData(official: BarangayOfficial | null): BarangayOfficialFormData {
  if (!official) {
    return {
      resident_search: '',
      resident_id: '',
      prefix: 'Mr.',
      first_name: '',
      middle_name: '',
      last_name: '',
      suffix: '',
      birth_date: '',
      gender: 'MALE',
      civil_status: 'SINGLE',
      nationality: 'FILIPINO',
      educational_attainment: 'NO_FORMAL_EDUCATION',
      mobile_number: '',
      email_address: '',
      complete_address: '',
      position: 'BARANGAY_CAPTAIN',
      committee_assignment: 'Health',
      term_start: '',
      term_end: '',
      term_number: 0,
      is_current_term: false,
      status: 'ACTIVE',
      profile_photo_url: ''
    };
  }

  const formData = {
    resident_search: '',
    resident_id: official.resident_id,
    prefix: official.prefix,
    first_name: official.first_name,
    middle_name: official.middle_name || '',
    last_name: official.last_name,
    suffix: official.suffix || '',
    birth_date: official.birth_date,
    gender: official.gender,
    nationality: official.nationality,
    civil_status: official.civil_status,
    educational_attainment: official.educational_attainment,
    mobile_number: official.mobile_number || '',
    email_address: official.email_address || '',
    complete_address: official.complete_address,
    position: official.position,
    committee_assignment: official.committee_assignment,
    term_start: new Date(official.term_start).toLocaleDateString('en-US'), // MM/DD/YYYY format
    term_end: new Date(official.term_end).toLocaleDateString('en-US'), // MM/DD/YYYY format
    term_number: official.term_number,
    is_current_term: official.is_current_term,
    status: official.status,
    profile_photo_url: official.profile_photo_url || ''
  };
  
  console.log(formData);
  return formData;
}

export function transformResidentToBarangayOfficialFormData(resident: Resident): BarangayOfficialFormData {
  return {
    resident_id: resident.id.toString(),
    prefix: 'Mr.',
    first_name: resident.first_name,
    middle_name: resident.middle_name || '',
    last_name: resident.last_name,
    suffix: resident.suffix || '',
    birth_date: resident.birth_date,
    gender: resident.gender,
    civil_status: resident.civil_status,
    nationality: resident.nationality,
    educational_attainment: resident.educational_attainment,
    mobile_number: resident.mobile_number || '',
    email_address: resident.email_address || '',
    complete_address: resident.complete_address,
    position: 'BARANGAY_CAPTAIN',
    committee_assignment: 'Health',
    term_start: '',
    term_end: '',
    term_number: 0,
    is_current_term: true,
    status: 'ACTIVE',
    profile_photo_url: resident.profile_photo_url || ''
  };
}

export type OfficialPosition = z.infer<typeof OfficialPositionSchema>;
export type CommitteeAssignment = z.infer<typeof CommitteeAssignmentSchema>;
export type OfficialStatus = z.infer<typeof OfficialStatusSchema>;
export type Prefix = z.infer<typeof PrefixSchema>;
export type BarangayOfficialFormData = z.infer<typeof BarangayOfficialFormDataSchema>;
export type BarangayOfficial = z.infer<typeof BarangayOfficialSchema>;
export type BarangayOfficialParams = z.infer<typeof BarangayOfficialParamsSchema>;
export type BarangayOfficialStatistics = z.infer<typeof BarangayOfficialStatisticsSchema>;

export const prefixes = PrefixSchema.options;
export const positions = OfficialPositionSchema.options;
export const committeeAssignments = CommitteeAssignmentSchema.options;