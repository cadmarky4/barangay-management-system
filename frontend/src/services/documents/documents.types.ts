// ============================================================================
// services/documents/documents.types.ts - Zod schemas and type definitions
// ============================================================================

import { z } from 'zod';

// Enum schemas following the guidelines
export const DocumentTypeSchema = z.enum([
  'BARANGAY_CLEARANCE',
  'BUSINESS_PERMIT', 
  'CERTIFICATE_OF_INDIGENCY',
  'CERTIFICATE_OF_RESIDENCY'
]);

export const DocumentStatusSchema = z.enum([
  'PENDING',
  'UNDER_REVIEW', 
  'APPROVED',
  'RELEASED',
  'REJECTED',
  'CANCELLED'
]);

export const DocumentPrioritySchema = z.enum([
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT'
]);

export const PaymentStatusSchema = z.enum([
  'UNPAID',
  'PAID',
  'WAIVED'
]);

// Document form data schema - all fields nullable except required ones
export const DocumentFormDataSchema = z.object({
  // Basic Document Information
  document_type: DocumentTypeSchema,
  resident_id: z.string().uuid('Resident is required'),
  applicant_name: z.string().min(1, 'Applicant name is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  
  // Contact Information
  applicant_address: z.string().nullable().optional(),
  applicant_contact: z.string().nullable().optional(),
  applicant_email: z.string().email('Invalid email address').nullable().optional().or(z.literal('')),
  
  // Request Details
  priority: DocumentPrioritySchema,
  needed_date: z.string().nullable().optional(),
  processing_fee: z.number().min(0, 'Processing fee must be a valid amount'),
  
  // Document Specific Fields (all nullable for unified table)
  // Barangay Clearance specific
  clearance_purpose: z.string().nullable().optional(),
  clearance_type: z.string().nullable().optional(),
  
  // Business Permit specific  
  business_name: z.string().nullable().optional(),
  business_type: z.string().nullable().optional(),
  business_address: z.string().nullable().optional(),
  business_owner: z.string().nullable().optional(),
  
  // Certificate of Indigency specific
  indigency_reason: z.string().nullable().optional(),
  monthly_income: z.number().nullable().optional(),
  family_size: z.number().nullable().optional(),
  
  // Certificate of Residency specific
  residency_period: z.string().nullable().optional(),
  previous_address: z.string().nullable().optional(),
  
  // Processing Information
  requirements_submitted: z.array(z.string()).nullable().optional(),
  notes: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
});

// Main Document schema with system fields
export const DocumentSchema = DocumentFormDataSchema.extend({
  id: z.string(),
  status: DocumentStatusSchema,
  payment_status: PaymentStatusSchema,
  
  // System tracking fields
  document_number: z.string().nullable().optional(),
  serial_number: z.string().nullable().optional(), // Auto-generated serial number for each document
  request_date: z.string(),
  processed_date: z.string().nullable().optional(),
  approved_date: z.string().nullable().optional(), 
  released_date: z.string().nullable().optional(),
  
  // Officials
  certifying_official: z.string().nullable().optional(),
  processed_by: z.number().nullable().optional(),
  approved_by: z.number().nullable().optional(),
  released_by: z.number().nullable().optional(),
  
  // Additional tracking
  expiry_date: z.string().nullable().optional(),
  
  // Timestamps (Laravel standard)
  created_at: z.string(),
  updated_at: z.string(),
  
  // Relations (loaded when needed)
  resident: z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    middle_name: z.string().nullable().optional(),
    suffix: z.string().nullable().optional(),
    complete_address: z.string(),
    mobile_number: z.string().nullable().optional(),
    email_address: z.string().nullable().optional(),
  }).nullable().optional(),
  
  processed_by_user: z.object({
    id: z.number(),
    name: z.string(),
    role: z.string(),
    position: z.string().nullable().optional(),
  }).nullable().optional(),
  
  approved_by_user: z.object({
    id: z.number(), 
    name: z.string(),
    role: z.string(),
    position: z.string().nullable().optional(),
  }).nullable().optional(),
  
  released_by_user: z.object({
    id: z.number(),
    name: z.string(),
    role: z.string(),
    position: z.string().nullable().optional(),
  }).nullable().optional(),
});

// Query parameters schema  
export const DocumentParamsSchema = z.object({
  page: z.number().min(1).nullable().optional(),
  per_page: z.number().min(1).max(100).nullable().optional(),
  search: z.string().nullable().optional(),
  document_type: DocumentTypeSchema.nullable().optional(),
  status: DocumentStatusSchema.nullable().optional(),
  priority: DocumentPrioritySchema.nullable().optional(),
  payment_status: PaymentStatusSchema.nullable().optional(),
  resident_id: z.number().nullable().optional(),
  date_from: z.string().nullable().optional(),
  date_to: z.string().nullable().optional(),
  sort_by: z.string().nullable().optional(),
  sort_order: z.enum(['asc', 'desc']).nullable().optional(),
});

// Statistics schemas
export const DocumentStatisticsSchema = z.object({
  total_documents: z.number(),
  pending_documents: z.number(),
  processing_documents: z.number(),
  approved_documents: z.number(),
  released_documents: z.number(),
  rejected_documents: z.number(),
  cancelled_documents: z.number().optional(),
  
  by_status: z.record(z.number()),
  by_type: z.record(z.number()),
  by_priority: z.record(z.number()),
  
  revenue: z.object({
    total: z.number(),
    pending: z.number(),
    collected: z.number(),
  }),
  
  processing_times: z.object({
    average_days: z.number(),
    fastest_days: z.number(),
    slowest_days: z.number(),
  }),
});

// Timeline tracking schema
export const DocumentTimelineItemSchema = z.object({
  date: z.string(),
  status: z.string(),
  description: z.string(),
  user_name: z.string().nullable().optional(),
});

export const DocumentTrackingSchema = z.object({
  document: DocumentSchema,
  timeline: z.array(DocumentTimelineItemSchema),
});

// Document action schemas
export const ProcessDocumentDataSchema = z.object({
  status: DocumentStatusSchema,
  processing_fee: z.number().nullable().optional(),
  document_number: z.string().nullable().optional(),
  certifying_official: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const RejectDocumentDataSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
  notes: z.string().nullable().optional(),
});

export const ReleaseDocumentDataSchema = z.object({
  document_number: z.string().nullable().optional(),
  released_to: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// Processing history schema
export const ProcessingHistoryItemSchema = z.object({
  id: z.number(),
  document_id: z.string(),
  action: z.string(),
  status_from: z.string().nullable().optional(),
  status_to: z.string(),
  processed_by: z.number(),
  processed_by_user: z.object({
    id: z.number(),
    name: z.string(),
    role: z.string(),
    position: z.string().nullable().optional(),
  }),
  notes: z.string().nullable().optional(),
  processed_at: z.string(),
});

// Type exports
export type DocumentType = z.infer<typeof DocumentTypeSchema>;
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;  
export type DocumentPriority = z.infer<typeof DocumentPrioritySchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type DocumentFormData = z.infer<typeof DocumentFormDataSchema>;
export type Document = z.infer<typeof DocumentSchema>;
export type DocumentParams = z.infer<typeof DocumentParamsSchema>;
export type DocumentStatistics = z.infer<typeof DocumentStatisticsSchema>;
export type DocumentTimelineItem = z.infer<typeof DocumentTimelineItemSchema>;
export type DocumentTracking = z.infer<typeof DocumentTrackingSchema>;
export type ProcessDocumentData = z.infer<typeof ProcessDocumentDataSchema>;
export type RejectDocumentData = z.infer<typeof RejectDocumentDataSchema>;
export type ReleaseDocumentData = z.infer<typeof ReleaseDocumentDataSchema>;
export type ProcessingHistoryItem = z.infer<typeof ProcessingHistoryItemSchema>;

// Transform function to handle date/time formatting and form data mapping
export const transformDocumentToFormData = (document: Document | null): DocumentFormData => {
  if (!document) {
    return {
      document_type: 'BARANGAY_CLEARANCE',
      resident_id: 0,
      applicant_name: '',
      purpose: '',
      applicant_address: '',
      applicant_contact: '',
      applicant_email: '',
      priority: 'NORMAL',
      needed_date: '',
      processing_fee: 0,
      clearance_purpose: '',
      clearance_type: '',
      business_name: '',
      business_type: '',
      business_address: '',
      business_owner: '',
      indigency_reason: '',
      monthly_income: undefined,
      family_size: undefined,
      residency_period: '',
      previous_address: '',
      requirements_submitted: [],
      notes: '',
      remarks: '',
    };
  }

  return {
    document_type: document.document_type,
    resident_id: document.resident_id,
    applicant_name: document.applicant_name,
    purpose: document.purpose,
    applicant_address: document.applicant_address || '',
    applicant_contact: document.applicant_contact || '',
    applicant_email: document.applicant_email || '',
    priority: document.priority,
    // Convert UTC date to local date string for form input
    needed_date: document.needed_date 
      ? new Date(document.needed_date).toISOString().slice(0, 10) 
      : '',
    processing_fee: document.processing_fee,
    clearance_purpose: document.clearance_purpose || '',
    clearance_type: document.clearance_type || '',
    business_name: document.business_name || '',
    business_type: document.business_type || '',
    business_address: document.business_address || '',
    business_owner: document.business_owner || '',
    indigency_reason: document.indigency_reason || '',
    monthly_income: document.monthly_income,
    family_size: document.family_size,
    residency_period: document.residency_period || '',
    previous_address: document.previous_address || '',
    requirements_submitted: document.requirements_submitted || [],
    notes: document.notes || '',
    remarks: document.remarks || '',
  };
};

