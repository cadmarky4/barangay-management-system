// ============================================================================
// types/households.ts - Zod schemas and type definitions
// ============================================================================

import { z } from 'zod';

// Enum schemas
export const HouseholdTypeSchema = z.enum([
  'NUCLEAR',
  'EXTENDED', 
  'SINGLE',
  'SINGLE_PARENT',
  'OTHER'
]);

export const MonthlyIncomeRangeSchema = z.enum([
  'BELOW_10000',
  'RANGE_10000_25000',
  'RANGE_25000_50000', 
  'RANGE_50000_100000',
  'ABOVE_100000'
]);

export const HouseTypeSchema = z.enum([
  'CONCRETE',
  'SEMI_CONCRETE',
  'WOOD',
  'BAMBOO',
  'MIXED'
]);

export const OwnershipStatusSchema = z.enum([
  'OWNED',
  'RENTED',
  'SHARED',
  'INFORMAL_SETTLER'
]);

export const HouseholdStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'TRANSFERRED'
]);

export const RelationshipTypeSchema = z.enum([
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
]);

// Head resident schema (minimal - just reference to resident)
export const HeadResidentSchema = z.object({
  id: z.string(),               // resident ID reference (UUID string to match residents)
  first_name: z.string(),       // Keep basic name for quick display
  last_name: z.string(),
  middle_name: z.string().nullable().optional(),
});

// Household member schema (minimal - just reference to resident)
export const HouseholdMemberSchema = z.object({
  id: z.string(),               // resident ID reference (UUID string to match residents)
  relationship: z.string(),     // relationship to household head
});

export const HouseholdFormDataSchema = z.object({
  // Basic Information
  household_number: z.string().optional(), // Auto-generated on frontend if not provided
  household_type: HouseholdTypeSchema,
  head_resident_id: z.string().nullable().optional(),
  
  // Address Information
  complete_address: z.string().min(1, 'households.form.error.completeAddressRequired'),
  
  // Income Information
  monthly_income: MonthlyIncomeRangeSchema.nullable().optional(),
  primary_income_source: z.string().nullable().optional(),
  
  // Classifications
  four_ps_beneficiary: z.boolean(),
  indigent_family: z.boolean(),
  has_senior_citizen: z.boolean(),
  has_pwd_member: z.boolean(),
  
  // House Details
  house_type: HouseTypeSchema.nullable().optional(),
  ownership_status: OwnershipStatusSchema.nullable().optional(),
  
  // Utilities
  has_electricity: z.boolean(),
  has_water_supply: z.boolean(),
  has_internet_access: z.boolean(),
  
  // Members - for form management with relationships
  memberRelationships: z.array(z.object({
    residentId: z.string(),
    relationship: z.string(),
  })).nullable().optional(),
  
  // Members - array of resident IDs for API (derived from memberRelationships)
  members: z.array(z.string()).nullable().optional(),
  
  // Backend expects member_ids with relationship data
  member_ids: z.array(z.object({
    resident_id: z.string(),
    relationship: z.string(),
  })).nullable().optional(),
  
  // Additional Information
  remarks: z.string().nullable().optional(),
});

// Main Household schema
export const HouseholdSchema = HouseholdFormDataSchema.extend({
  id: z.string().uuid(),
  created_by: z.string().uuid().nullable().optional(),
  updated_by: z.string().uuid().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  
  // Relationships
  head_resident: HeadResidentSchema.nullable().optional(),
  members: z.array(HouseholdMemberSchema).nullable().optional(),
});

// Query parameters schema
export const HouseholdParamsSchema = z.object({
  page: z.number().min(1).optional(),
  per_page: z.number().min(1).max(100).optional(),
  search: z.string().nullable().optional(),
  household_type: HouseholdTypeSchema.nullable().optional(),
  barangay: z.string().nullable().optional(),
  monthly_income: MonthlyIncomeRangeSchema.nullable().optional(),
  house_type: HouseTypeSchema.nullable().optional(),
  ownership_status: OwnershipStatusSchema.nullable().optional(),
  four_ps_beneficiary: z.boolean().nullable().optional(),
  indigent_family: z.boolean().nullable().optional(),
  has_senior_citizen: z.boolean().nullable().optional(),
  has_pwd_member: z.boolean().nullable().optional(),
  has_electricity: z.boolean().nullable().optional(),
  has_water_supply: z.boolean().nullable().optional(),
  has_internet_access: z.boolean().nullable().optional(),
  status: HouseholdStatusSchema.nullable().optional(),
});

// Statistics schemas
export const HouseholdStatisticsSchema = z.object({
  total_households: z.number(),
  active_households: z.number(),
  inactive_households: z.number(),
  by_barangay: z.record(z.number()),
  by_household_type: z.record(z.number()),
  by_house_type: z.record(z.number()),
  by_ownership_status: z.record(z.number()),
  by_monthly_income: z.record(z.number()),
  classifications: z.object({
    four_ps_beneficiaries: z.number(),
    indigent_families: z.number(),
    with_senior_citizens: z.number(),
    with_pwd_members: z.number(),
  }),
  utilities: z.object({
    with_electricity: z.number(),
    with_water_supply: z.number(),
    with_internet_access: z.number(),
  }),
});

// Special lists response schema
export const SpecialListResponseSchema = z.object({
  data: z.array(HouseholdSchema),
  count: z.number(),
});

export type HouseholdFormData = z.infer<typeof HouseholdFormDataSchema>;

export const transformHouseholdToFormData = (household: Household | null): HouseholdFormData => {
  if (!household) {
    return {
      household_number: '', // Will be auto-generated by the form component
      household_type: 'NUCLEAR',
      head_resident_id: null,
      complete_address: '',
      monthly_income: null,
      primary_income_source: null,
      four_ps_beneficiary: false,
      indigent_family: false,
      has_senior_citizen: false,
      has_pwd_member: false,
      house_type: null,
      ownership_status: null,
      has_electricity: false,
      has_water_supply: false,
      has_internet_access: false,
      memberRelationships: null,
      members: null,
      remarks: null,
    };
  }

  return {
    household_number: household.household_number || '', // Use existing number for edit mode
    household_type: household.household_type as HouseholdType,
    head_resident_id: household.head_resident_id,
    complete_address: household.complete_address,
    monthly_income: household.monthly_income as MonthlyIncomeRange,
    primary_income_source: household.primary_income_source,
    four_ps_beneficiary: household.four_ps_beneficiary || false,
    indigent_family: household.indigent_family || false,
    has_senior_citizen: household.has_senior_citizen || false,
    has_pwd_member: household.has_pwd_member || false,
    house_type: household.house_type as HouseType,
    ownership_status: household.ownership_status as OwnershipStatus,
    has_electricity: household.has_electricity || false,
    has_water_supply: household.has_water_supply || false,
    has_internet_access: household.has_internet_access || false,
    // Convert household members to form structure
    memberRelationships: household.members?.map(member => ({
      residentId: member.id,
      relationship: member.relationship || 'OTHER'
    })) || null,
    members: household.members?.map(member => member.id) || null,
    remarks: household.remarks,
  };
};

// Type exports
export type HouseholdType = z.infer<typeof HouseholdTypeSchema>;
export type MonthlyIncomeRange = z.infer<typeof MonthlyIncomeRangeSchema>;
export type HouseType = z.infer<typeof HouseTypeSchema>;
export type OwnershipStatus = z.infer<typeof OwnershipStatusSchema>;
export type HouseholdStatus = z.infer<typeof HouseholdStatusSchema>;
export type RelationshipType = z.infer<typeof RelationshipTypeSchema>;
export type HeadResident = z.infer<typeof HeadResidentSchema>;
export type HouseholdMember = z.infer<typeof HouseholdMemberSchema>;
export type Household = z.infer<typeof HouseholdSchema>;
export type HouseholdParams = z.infer<typeof HouseholdParamsSchema>;
export type HouseholdStatistics = z.infer<typeof HouseholdStatisticsSchema>;
export type SpecialListResponse = z.infer<typeof SpecialListResponseSchema>;