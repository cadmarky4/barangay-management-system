// ============================================================================
// types/residents.ts - Updated Zod schemas and type definitions
// ============================================================================

import { z } from 'zod';

// Enum schemas
export const GenderSchema = z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']);

export const CivilStatusSchema = z.enum([
  'SINGLE',
  'LIVE_IN',
  'MARRIED',
  'WIDOWED',
  'DIVORCED',
  'SEPARATED',
  'ANNULLED',
  'PREFER_NOT_TO_SAY'
]);

export const EmploymentStatusSchema = z.enum([
  'EMPLOYED',
  'UNEMPLOYED',
  'SELF_EMPLOYED',
  'RETIRED',
  'STUDENT',
  'OFW'
]);

export const VoterStatusSchema = z.enum([
  'NOT_REGISTERED',
  'REGISTERED',
  'DECEASED',
  'TRANSFERRED'
]);

export const ResidentStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'DECEASED',
  'TRANSFERRED'
]);

export const IdTypeSchema = z.enum([
  'NATIONAL_ID',
  'PASSPORT',
  "DRIVER'S_LICENSE",
  "VOTER'S_ID",
  'PHILHEALTH_ID',
  'SSS_ID',
  'UMID'
]);

export const NationalitySchema = z.enum([
  'FILIPINO',
  'AMERICAN',
  'BRITISH',
  'CANADIAN',
  'AUSTRALIAN',
  'OTHER'
]);

export const ReligionSchema = z.enum([
  'CATHOLIC',
  'IGLESIA_NI_CRISTO',
  'EVANGELICAL',
  'PROTESTANT',
  'ISLAM',
  'BUDDHIST',
  'HINDU',
  'SEVENTH_DAY_ADVENTIST',
  'JEHOVAHS_WITNESS',
  'BORN_AGAIN_CHRISTIAN',
  'ORTHODOX',
  'JUDAISM',
  'ATHEIST',
  'AGLIPAYAN',
  'OTHER',
  'PREFER_NOT_TO_SAY'
]);

export const EducationalAttainmentSchema = z.enum([
  'NO_FORMAL_EDUCATION',
  'ELEMENTARY_UNDERGRADUATE',
  'ELEMENTARY_GRADUATE',
  'HIGH_SCHOOL_UNDERGRADUATE',
  'HIGH_SCHOOL_GRADUATE',
  'COLLEGE_UNDERGRADUATE',
  'COLLEGE_GRADUATE',
  'POST_GRADUATE',
  'VOCATIONAL',
  'OTHER'
]);

// Household schema
export const HouseholdSchema = z.object({
  id: z.string(),
  household_number: z.string(),
  household_head_name: z.string(),
});

export const ResidentFormDataSchema = z.object({
  // Basic Information
  first_name: z.string().min(1, 'residents.form.error.firstNameRequired'),
  last_name: z.string().min(1, 'residents.form.error.lastNameRequired'),
  middle_name: z.string().optional(),
  suffix: z.string().optional(),
  birth_date: z.string()
    .min(1, 'residents.form.error.birthDateRequired')
    .refine(
      (date) => {
        const d = new Date(date);
        const today = new Date();
        // Remove time part for comparison
        d.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return d < today;
      },
      { message: 'residents.form.error.birthDateFuture' }
    ),
  age: z.number().positive('residents.form.error.agePositive').optional(),
  birth_place: z.string().min(1, 'residents.form.error.birthPlaceRequired'),
  gender: GenderSchema,

  civil_status: CivilStatusSchema,
  nationality: NationalitySchema,
  religion: ReligionSchema,

  // Employment and Education
  educational_attainment: EducationalAttainmentSchema,
  employment_status: EmploymentStatusSchema,
  occupation: z.string().optional(),
  employer: z.string().optional(),
  
  // Contact Information
  mobile_number: z.string().optional(),
  landline_number: z.string().optional(),
  email_address: z.union([z.string().email('residents.form.validation.email'), z.literal('')]).optional(),

  // Address Information - Make required fields actually required
  region: z.string().min(1, 'residents.form.error.regionRequired'),
  province: z.string().min(1, 'residents.form.error.provinceRequired'),
  city: z.string().min(1, 'residents.form.error.cityRequired'),
  barangay: z.string().min(1, 'residents.form.error.barangayRequired'),
  house_number: z.string().optional(),
  street: z.string().optional(),
  complete_address: z.string().min(1, 'residents.form.validation.required'),
  
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

  // Health & Medical
  medical_conditions: z.string().optional(),
  allergies: z.string().optional(),
  
  // Special Classifications - All required as boolean with defaults
  senior_citizen: z.boolean(),
  person_with_disability: z.boolean(),
  disability_type: z.string().nullable().optional(),
  indigenous_people: z.boolean(),
  indigenous_group: z.string().nullable().optional(),
  four_ps_beneficiary: z.boolean(),
  four_ps_household_id: z.string().nullable().optional(),
  
  // Profile photo
  profile_photo_url: z.string().optional(),
});

// Main Resident schema
export const ResidentSchema = ResidentFormDataSchema.extend({
  id: z.string().uuid(),
  status: ResidentStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

// Updated ResidentParamsSchema without household_id
export const ResidentParamsSchema = z.object({
  page: z.number().min(1).optional(),
  per_page: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
  status: ResidentStatusSchema.optional(),
  gender: GenderSchema.optional(),
  civil_status: CivilStatusSchema.optional(),
  employment_status: EmploymentStatusSchema.optional(),
  voter_status: VoterStatusSchema.optional(),
  
  // Special classifications
  senior_citizen: z.boolean().optional(),
  person_with_disability: z.boolean().optional(),
  indigenous_people: z.boolean().optional(),
  four_ps_beneficiary: z.boolean().optional(),
  
  // Age filters
  age_from: z.number().min(0).optional(),
  age_to: z.number().min(0).optional(),
  
  // NEW: Household-related filters using pivot table approach
  is_household_head: z.boolean().optional(),
  household_relationship: z.enum([
    'HEAD',
    'SPOUSE',
    'SON', 
    'DAUGHTER',
    'FATHER',
    'MOTHER',
    'BROTHER',
    'SISTER',
    'GRANDFATHER',
    'GRANDMOTHER',
    'GRANDSON',
    'GRANDDAUGHTER',
    'UNCLE',
    'AUNT',
    'NEPHEW',
    'NIECE',
    'COUSIN',
    'IN_LAW',
    'BOARDER',
    'OTHER'
  ]).optional(),
  
  // Address filters (these remain the same)
  barangay: z.string().optional(),
  region: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
});

// Statistics schemas
export const ResidentStatisticsSchema = z.object({
  total_residents: z.number(),
  active_residents: z.number(),
  inactive_residents: z.number(),
  senior_citizens: z.number(),
  pwd_residents: z.number(),
  four_ps_beneficiaries: z.number(),
  registered_voters: z.number(),
  male_residents: z.number(),
  female_residents: z.number(),
  by_age_group: z.record(z.number()),
  by_civil_status: z.record(z.number()),
  by_employment_status: z.record(z.number()),
});

export const AgeGroupStatisticsSchema = z.object({
  children: z.number(), // 0-17
  adults: z.number(),   // 18-59
  seniors: z.number(),  // 60+
  by_age_range: z.record(z.number()),
});

// Special lists response schema
export const SpecialListResponseSchema = z.object({
  data: z.array(ResidentSchema),
  count: z.number(),
});

export type ResidentFormData = z.infer<typeof ResidentFormDataSchema>;

export const transformResidentToFormData = (resident: Resident | null): ResidentFormData => {
  if (!resident) {
    return {
      first_name: '',
      last_name: '',
      middle_name: '',
      suffix: '',
      birth_date: '',
      age: 0,
      birth_place: '',
      gender: 'MALE',
      civil_status: 'SINGLE',
      nationality: 'FILIPINO',
      religion: 'CATHOLIC',
      employment_status: 'UNEMPLOYED',
      educational_attainment: 'NO_FORMAL_EDUCATION',
      mobile_number: '',
      landline_number: '',
      email_address: '',
      region: '',
      province: '',
      city: '',
      barangay: '',
      house_number: '',
      street: '',
      complete_address: '',
      mother_name: '',
      father_name: '',
      emergency_contact_name: '',
      emergency_contact_number: '',
      emergency_contact_relationship: '',
      primary_id_type: '',
      id_number: '',
      philhealth_number: '',
      sss_number: '',
      tin_number: '',
      voters_id_number: '',
      voter_status: 'NOT_REGISTERED',
      precinct_number: '',
      occupation: '',
      employer: '',
      medical_conditions: '',
      allergies: '',
      senior_citizen: false,
      person_with_disability: false,
      disability_type: '',
      indigenous_people: false,
      indigenous_group: '',
      four_ps_beneficiary: false,
      four_ps_household_id: '',
      profile_photo_url: '',
    };
  }

  return {
    first_name: resident.first_name,
    last_name: resident.last_name,
    middle_name: resident.middle_name || '',
    suffix: resident.suffix || '',
    birth_date: resident.birth_date ? new Date(resident.birth_date).toISOString().slice(0, 10) : '',
    age: resident.age || 0,
    birth_place: resident.birth_place,
    gender: resident.gender as Gender || 'MALE',
    civil_status: resident.civil_status as CivilStatus || 'SINGLE',
    nationality: resident.nationality as Nationality || 'FILIPINO',
    religion: resident.religion as Religion || 'CATHOLIC',
    employment_status: resident.employment_status as EmploymentStatus || 'UNEMPLOYED',
    educational_attainment: resident.educational_attainment as EducationalAttainment || 'NO_FORMAL_EDUCATION',
    mobile_number: resident.mobile_number || '',
    landline_number: resident.landline_number || '',
    email_address: resident.email_address || '',
    region: resident.region || '',
    province: resident.province || '',
    city: resident.city || '',
    barangay: resident.barangay || '',
    house_number: resident.house_number || '',
    street: resident.street || '',
    complete_address: resident.complete_address,
    mother_name: resident.mother_name || '',
    father_name: resident.father_name || '',
    emergency_contact_name: resident.emergency_contact_name || '',
    emergency_contact_number: resident.emergency_contact_number || '',
    emergency_contact_relationship: resident.emergency_contact_relationship || '',
    primary_id_type: resident.primary_id_type || '',
    id_number: resident.id_number || '',
    philhealth_number: resident.philhealth_number || '',
    sss_number: resident.sss_number || '',
    tin_number: resident.tin_number || '',
    voters_id_number: resident.voters_id_number || '',
    voter_status: resident.voter_status || 'NOT_REGISTERED',
    precinct_number: resident.precinct_number || '',
    occupation: resident.occupation || '',
    employer: resident.employer || '',
    medical_conditions: resident.medical_conditions || '',
    allergies: resident.allergies || '',
    senior_citizen: resident.senior_citizen || false,
    person_with_disability: resident.person_with_disability || false,
    disability_type: resident.disability_type || '',
    indigenous_people: resident.indigenous_people || false,
    indigenous_group: resident.indigenous_group || '',
    four_ps_beneficiary: resident.four_ps_beneficiary || false,
    four_ps_household_id: resident.four_ps_household_id || '',
    profile_photo_url: resident.profile_photo_url || '',
  };
};

// Type exports
export type Gender = z.infer<typeof GenderSchema>;
export type CivilStatus = z.infer<typeof CivilStatusSchema>;
export type EmploymentStatus = z.infer<typeof EmploymentStatusSchema>;
export type VoterStatus = z.infer<typeof VoterStatusSchema>;
export type ResidentStatus = z.infer<typeof ResidentStatusSchema>;
export type Nationality = z.infer<typeof NationalitySchema>;
export type Religion = z.infer<typeof ReligionSchema>;
export type EducationalAttainment = z.infer<typeof EducationalAttainmentSchema>;
export type IdType = z.infer<typeof IdTypeSchema>;
export type Household = z.infer<typeof HouseholdSchema>;
export type Resident = z.infer<typeof ResidentSchema>;
export type ResidentParams = z.infer<typeof ResidentParamsSchema>;
export type ResidentStatistics = z.infer<typeof ResidentStatisticsSchema>;
export type AgeGroupStatistics = z.infer<typeof AgeGroupStatisticsSchema>;
export type SpecialListResponse = z.infer<typeof SpecialListResponseSchema>;