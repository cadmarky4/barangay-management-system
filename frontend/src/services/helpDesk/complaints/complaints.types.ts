import { z } from "zod";
import { BaseTicketSchema, FeedbackCategorySchema } from "../helpDesk.type";
import { DepartmentSchema } from "@/services/users/users.types";

export const ComplaintSchema = z.object({
    id: z.string().uuid().optional(),
    base_ticket_id: z.string().uuid(),
    c_category: z.enum(FeedbackCategorySchema.options, {
      errorMap: (_, __) => ({ message: 'helpDesk.complaintsForm.validation.invalidCategory' })
    }),
    department: z.enum(DepartmentSchema.options, {
      errorMap: (_, __) => ({ message: 'helpDesk.complaintsForm.validation.invalidDepartment' })
    }),
    location: z.string().optional().nullable(),
})

export const ViewComplaintSchema = z.object({
    ticket: BaseTicketSchema,
    complaint: ComplaintSchema,
})

export const CreateComplaintSchema = z.object({
  ticket: BaseTicketSchema.extend({
    requester_name: z.string().optional().nullable(),
    contact_number: z.string().optional().nullable(),
    complete_address: z.string().optional().nullable(),
  }).omit({
    id: true, // AUTO GENERATED
    ticket_number: true, // AUTO GENERATED
    created_at: true, // AUTO GENERATED
    updated_at: true, // AUTO GENERATED
    status: true, // DEFAULTS TO 'OPEN'
  }).extend({
    resident_search: z.string().optional().nullable(),
    category: z.literal('COMPLAINT')
  }),

  complaint: ComplaintSchema.omit({
    id: true, // AUTO GENERATED
    base_ticket_id: true, // AUTO GENERATED
  })
})

export const EditComplaintSchema = z.object({
  ticket: BaseTicketSchema.partial().omit({
    id: true,           // Cannot change ID
    ticket_number: true, // Cannot change ticket number
    created_at: true,   // Cannot change creation date
    updated_at: true, // AUTO GENERATED
    category: true      // Cannot change category type
  }).extend({
    requester_name: z.string().optional().nullable(),
    contact_number: z.string().optional().nullable(),
    complete_address: z.string().optional().nullable(),
    resident_search: z.string().optional().nullable(),
  }),

  complaint: ComplaintSchema.partial().omit({ 
    id: true,        // Cannot change ID
    base_ticket_id: true  // Cannot change parent ticket reference
  })
})

export type Complaint = z.infer<typeof ComplaintSchema>;
export type ViewComplaint = z.infer<typeof ViewComplaintSchema>;
export type CreateComplaint = z.infer<typeof CreateComplaintSchema>;
export type EditComplaint = z.infer<typeof EditComplaintSchema>;