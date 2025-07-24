import { z } from "zod";
import { BaseTicketSchema, timeSlotOptions } from "../helpDesk.type";

const regex = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

export const IncidentTypeSchema = z.enum([
  'THEFT',
  'PHYSICAL_ASSAULT',
  'VERBAL_ASSAULT',
  'PROPERTY_DAMAGE',
  'DISTURBANCE',
  'TRESPASSING',
  'FRAUD',
  'HARASSMENT',
  'DOMESTIC_DISPUTE',
  'NOISE_COMPLAINT',
  'OTHER'
]);

export const BlotterInvolvementSchema = z.enum([
  'RESPONDENT',
  'WITNESS',
  'VICTIM',
  'SUSPECT',
])

export const OtherPeopleInvolvedSchema = z.object({
  full_name: z.string().min(1).max(255),
  address: z.string().max(255).nullable(),
  contact_number: z.string().length(16, 'helpDesk.validation.contactLengthValidation'),
  involvement: BlotterInvolvementSchema,
})

export const CreateSupportingDocumentsSchema = z.object({
  url: z.string(),
})

export const ViewSupportingDocumentsSchema = z.object({
    blotter_id: z.string().uuid(),
    url: z.string(),
  })

export const BlotterSchema = z.object({
    id: z.string().uuid().optional(),
    base_ticket_id: z.string().uuid(),
    type_of_incident: z.enum(IncidentTypeSchema.options, {
            errorMap: (__, _) => ({ message: 'helpDesk.blotterForm.validation.invalidIncidentType' })
    }),
    date_of_incident: z.string().regex(regex, { message: 'helpDesk.validation.dateInMM/DD/YYYY' }),
    time_of_incident: z.enum(timeSlotOptions, {
        errorMap: (_, __) => ({ message: 'helpDesk.validation.invalidTimeSlots' })
    }),
    location_of_incident: z.string().min(1, 'helpDesk.blotterForm.validation.locationRequired'),
    other_people_involved: z.array(OtherPeopleInvolvedSchema).optional().nullable(),
    supporting_documents: z.array(CreateSupportingDocumentsSchema).optional().nullable(),
})

export const ViewBlotterSchema = z.object({
    ticket: BaseTicketSchema,
    blotter: BlotterSchema,
})

export const CreateBlotterSchema = z.object({
  ticket: BaseTicketSchema.omit({
    id: true, // AUTO GENERATED
    ticket_number: true, // AUTO GENERATED
    created_at: true, // AUTO GENERATED
    updated_at: true, // AUTO GENERATED
    status: true, // DEFAULTS TO 'OPEN'
  }).extend({
    resident_search: z.string().optional().nullable(),
    category: z.literal('BLOTTER')
  }),

  blotter: BlotterSchema.omit({
    id: true, // AUTO GENERATED
    base_ticket_id: true, // AUTO GENERATED
  })
})

export const EditBlotterSchema = z.object({
  ticket: BaseTicketSchema.partial().omit({
    id: true,           // Cannot change ID
    ticket_number: true, // Cannot change ticket number
    created_at: true,   // Cannot change creation date
    updated_at: true, // AUTO GENERATED
    category: true      // Cannot change category type
  }).extend({
    resident_search: z.string().optional().nullable(),
  }),

  blotter: BlotterSchema.partial().omit({ 
    id: true,        // Cannot change ID
    base_ticket_id: true  // Cannot change parent ticket reference
  })
})

export const UploadSupportingDocumentsSchema = z.object({
    blotter_id: z.string().uuid(),
    file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'].includes(file.type),
      'Only JPEG, PNG, GIF, and PDF files are allowed'
    ),
})

export type IncidentType = z.infer<typeof IncidentTypeSchema>;
export type BlotterInvolvement = z.infer<typeof BlotterInvolvementSchema>;
export type OtherPeopleInvolved = z.infer<typeof OtherPeopleInvolvedSchema>;
export type CreateSupportingDocuments = z.infer<typeof CreateSupportingDocumentsSchema>;
export type ViewSupportingDocuments = z.infer<typeof ViewSupportingDocumentsSchema>;
export type Blotter = z.infer<typeof BlotterSchema>;
export type ViewBlotter = z.infer<typeof ViewBlotterSchema>
export type CreateBlotter = z.infer<typeof CreateBlotterSchema>
export type EditBlotter = z.infer<typeof EditBlotterSchema>
export type UploadSupportingDocuments = z.infer<typeof UploadSupportingDocumentsSchema>

export const incidentOptions = IncidentTypeSchema.options;
export const blotterInvolvementOptions = BlotterInvolvementSchema.options;