// // Suggestion-specific types and interfaces
import { z } from "zod";
import { BaseTicketSchema, FeedbackCategorySchema } from "../helpDesk.type";

export const SuggestionSchema = z.object({
    id: z.string().uuid().optional(),
    base_ticket_id: z.string().uuid(),
    s_category: z.enum(FeedbackCategorySchema.options, {
          errorMap: (_, __) => ({ message: 'helpDesk.suggestionsForm.validation.invalidCategory' })
    }),
    expected_benefits: z.string().optional().nullable(),
    implementation_ideas: z.string().optional().nullable(),
    resources_needed: z.string().optional().nullable(),
})

export const ViewSuggestionSchema = z.object({
    ticket: BaseTicketSchema,
    suggestion: SuggestionSchema,
})

export const CreateSuggestionSchema = z.object({
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
    category: z.literal('SUGGESTION')
  }),

  suggestion: SuggestionSchema.omit({
    id: true, // AUTO GENERATED
    base_ticket_id: true, // AUTO GENERATED
  })
})

export const EditSuggestionSchema = z.object({
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

  suggestion: SuggestionSchema.partial().omit({ 
    id: true,        // Cannot change ID
    base_ticket_id: true  // Cannot change parent ticket reference
  })
})

// Inferred Types
export type Suggestion = z.infer<typeof SuggestionSchema>;
export type ViewSuggestion = z.infer<typeof ViewSuggestionSchema>;
export type CreateSuggestion = z.infer<typeof CreateSuggestionSchema>;
export type EditSuggestion = z.infer<typeof EditSuggestionSchema>;