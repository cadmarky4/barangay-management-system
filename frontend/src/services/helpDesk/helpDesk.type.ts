import { z } from 'zod';

export const TicketCategorySchema = z.enum(['APPOINTMENT', 'BLOTTER', 'COMPLAINT', 'SUGGESTION'])
export const PrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
// appointment status and base ticket status are one and the same now
export const StatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'])
export const FeedbackCategorySchema = z.enum([
    'PUBLIC_SERVICES',
    'INFRASTRUCTURE',
    'SOCIAL_WELFARE',
    'PUBLIC_SAFETY',
    'HEALTH_SERVICES',
    'ENVIRONMENTAL',
    'EDUCATION',
    'BUSINESS_PERMITS',
    'COMMUNITY_PROGRAMS',
    'OTHERS'
])
export const TimeSlotsSchema = z.enum([
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00'
])

export const BaseTicketSchema = z.object({
    // PK, will be generated on the server-side
    id: z.string().uuid().optional(),
    // human readable ticket
    ticket_number: z.string().max(50),
    subject: z.string().min(1,'helpDesk.validation.subjectRequired').max(255),
    description: z.string().min(1,'helpDesk.validation.descriptionRequired'),
    priority: z.enum(PrioritySchema.options, {
        errorMap: (__, _) => ({ message: 'helpDesk.validation.invalidPriority' })
    }),
    requester_name: z.string().min(1, 'helpDesk.validation.fullNameRequired').max(255,'helpDesk.appointmentsForm.validation.fullNameExceeded'),
    resident_id: z.string().uuid().nullable(),
    contact_number: z.string().length(16, 'helpDesk.validation.contactLengthValidation'),
    // email_address: z.string().email('helpDesk.validation.invalidEmailFormat').max(255).optional(),
    email_address: z.string()
        .max(255)
        .refine(val => val === '' || z.string().email().safeParse(val).success, {
            message: 'helpDesk.validation.invalidEmailFormat',
        })
        .optional()
        .nullable(),
    complete_address: z.string().min(1,'helpDesk.validation.completeAddressRequired').max(255, 'helpDesk.validation.maxCharExcceeded'),
    category: TicketCategorySchema,
    status: StatusSchema,
    created_at: z.date(),
    updated_at: z.date(),
})

export const PaginationSchema = z.object({
    current_page: z.number().min(1).optional(),
    from: z.number(),
    has_more_pages: z.boolean(),
    last_page: z.number(),
    per_page: z.number(),
    to: z.number(),
    total: z.number(),
})

export const HelpDeskStatisticsSchema = z.object({
    total_tickets: z.number(),
    pending_review: z.number(),
    in_progress: z.number(),
    resolved: z.number(),
})

export const HelpDeskTicketParamsSchema = z.object({
  page: z.number().min(1).optional(),
  category: TicketCategorySchema.optional(),
  priority: PrioritySchema.optional(),
  status: StatusSchema.optional(),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  per_page: z.number().optional()
})

export type TicketCategory = z.infer<typeof TicketCategorySchema>
export type Priority = z.infer<typeof PrioritySchema>
export type Status = z.infer<typeof StatusSchema>
export type BaseTicket = z.infer<typeof BaseTicketSchema>
export type FeedbackCategory = z.infer<typeof FeedbackCategorySchema>
export type TimeSlots = z.infer<typeof TimeSlotsSchema>
export type HelpDeskTicketParams = z.infer<typeof HelpDeskTicketParamsSchema>
export type HelpDeskStatistics = z.infer<typeof HelpDeskStatisticsSchema>

export const timeSlotOptions = TimeSlotsSchema.options;
export const priorities = PrioritySchema.options;
export const prioritiesAll = z.enum(["ALL", ...PrioritySchema.options] as const).options;
export const statusOptions = StatusSchema.options;
export const statusOptionsAll = z.enum(["ALL", ...StatusSchema.options] as const).options;
export const categoryOptions = TicketCategorySchema.options;
export const categoryOptionsAll = z.enum(["ALL", ...TicketCategorySchema.options] as const).options;
export const feedbackCategoryOptions = FeedbackCategorySchema.options;