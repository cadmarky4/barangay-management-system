// ============================================================================
// services/agenda/agenda.types.ts - Zod schemas and type definitions for agenda
// ============================================================================

import { z } from 'zod';

// Enum schemas
export const AgendaCategorySchema = z.enum([
  'MEETING',
  'REVIEW',
  'PRESENTATION', 
  'EVALUATION',
  'BUDGET',
  'PLANNING',
  'INSPECTION',
  'OTHER'
]);

export const AgendaPrioritySchema = z.enum([
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT'
]);

export const AgendaStatusSchema = z.enum([
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'POSTPONED'
]);

// Agenda form data schema
export const AgendaFormDataSchema = z.object({
  // Basic Information
  title: z.string().min(1, 'agenda.form.error.titleRequired'),
  description: z.string().nullable().optional(),
  
  // Schedule Information
  date: z.string().min(1, 'agenda.form.error.dateRequired'),
  time: z.string().min(1, 'agenda.form.error.timeRequired'),
  end_time: z.string().nullable().optional(),
  duration_minutes: z.number().min(1).optional(),
  
  // Categorization
  category: AgendaCategorySchema,
  priority: AgendaPrioritySchema,
  
  // Location Information
  location: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  
  // Participants
  participants: z.array(z.string()).nullable().optional(),
  organizer: z.string().nullable().optional(),
  
  // Additional Information
  notes: z.string().nullable().optional(),
  attachments: z.array(z.string()).nullable().optional(),
  
  // Notification settings
  reminder_enabled: z.boolean(),
  reminder_minutes_before: z.number(),
});

// Main Agenda schema with system fields
export const AgendaSchema = AgendaFormDataSchema.extend({
  id: z.string().uuid(),
  status: AgendaStatusSchema,
  
  // System tracking fields
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.number().nullable().optional(),
  updated_by: z.number().nullable().optional(),
  
  // Relations (loaded when needed)
  creator: z.object({
    id: z.number(),
    name: z.string(),
    role: z.string(),
  }).nullable().optional(),
  
  updater: z.object({
    id: z.number(),
    name: z.string(),
    role: z.string(),
  }).nullable().optional(),
});

// Query parameters schema
export const AgendaParamsSchema = z.object({
  page: z.number().min(1).optional(),
  per_page: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
  category: AgendaCategorySchema.optional(),
  priority: AgendaPrioritySchema.optional(),
  status: AgendaStatusSchema.optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  month: z.string().optional(),
  year: z.number().optional(),
  location: z.string().optional(),
  organizer: z.string().optional(),
  sort_by: z.enum([
    'title',
    'date',
    'time',
    'category',
    'priority',
    'status',
    'created_at',
    'updated_at'
  ]).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

// Statistics schemas
export const AgendaStatisticsSchema = z.object({
  total_agendas: z.number(),
  scheduled_agendas: z.number(),
  in_progress_agendas: z.number(),
  completed_agendas: z.number(),
  cancelled_agendas: z.number(),
  postponed_agendas: z.number(),
  
  by_category: z.record(z.number()),
  by_priority: z.record(z.number()),
  by_status: z.record(z.number()),
  
  upcoming_this_week: z.number(),
  upcoming_this_month: z.number(),
  overdue_agendas: z.number(),
});

// Calendar event schema (for displaying in calendar)
export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  time: z.string(),
  end_time: z.string().nullable().optional(),
  category: AgendaCategorySchema,
  priority: AgendaPrioritySchema,
  status: AgendaStatusSchema,
  color: z.string(), // Hex color for calendar display
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
});

// Update agenda status schema
export const UpdateAgendaStatusSchema = z.object({
  status: AgendaStatusSchema,
  notes: z.string().nullable().optional(),
});

// Type exports
export type AgendaCategory = z.infer<typeof AgendaCategorySchema>;
export type AgendaPriority = z.infer<typeof AgendaPrioritySchema>;
export type AgendaStatus = z.infer<typeof AgendaStatusSchema>;
export type AgendaFormData = z.infer<typeof AgendaFormDataSchema>;
export type Agenda = z.infer<typeof AgendaSchema>;
export type AgendaParams = z.infer<typeof AgendaParamsSchema>;
export type AgendaStatistics = z.infer<typeof AgendaStatisticsSchema>;
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
export type UpdateAgendaStatus = z.infer<typeof UpdateAgendaStatusSchema>;

// Transform function to handle form data mapping
export const transformAgendaToFormData = (agenda: Agenda | null): AgendaFormData => {
  if (!agenda) {
    return {
      title: '',
      description: '',
      date: '',
      time: '',
      end_time: '',
      duration_minutes: 60,
      category: 'MEETING',
      priority: 'NORMAL',
      location: '',
      venue: '',
      participants: [],
      organizer: '',
      notes: '',
      attachments: [],
      reminder_enabled: true,
      reminder_minutes_before: 15,
    };
  }

  return {
    title: agenda.title,
    description: agenda.description || '',
    date: agenda.date,
    time: agenda.time,
    end_time: agenda.end_time || '',
    duration_minutes: agenda.duration_minutes || 60,
    category: agenda.category,
    priority: agenda.priority,
    location: agenda.location || '',
    venue: agenda.venue || '',
    participants: agenda.participants || [],
    organizer: agenda.organizer || '',
    notes: agenda.notes || '',
    attachments: agenda.attachments || [],
    reminder_enabled: agenda.reminder_enabled,
    reminder_minutes_before: agenda.reminder_minutes_before,
  };
};

// Category color mappings for calendar display
export const getCategoryColor = (category: AgendaCategory): string => {
  const colors = {
    MEETING: '#60a5fa',      // blue-400
    REVIEW: '#4ade80',       // green-400
    PRESENTATION: '#a78bfa', // purple-400
    EVALUATION: '#facc15',   // yellow-400
    BUDGET: '#f87171',       // red-400
    PLANNING: '#818cf8',     // indigo-400
    INSPECTION: '#fb923c',   // orange-400
    OTHER: '#9ca3af',        // gray-400
  };
  
  return colors[category];
};

// Priority color mappings
export const getPriorityColor = (priority: AgendaPriority): string => {
  const colors = {
    LOW: '#9ca3af',      // gray-400
    NORMAL: '#60a5fa',   // blue-400
    HIGH: '#f59e0b',     // amber-500
    URGENT: '#ef4444',   // red-500
  };
  
  return colors[priority];
};

// Status color mappings
export const getStatusColor = (status: AgendaStatus): string => {
  const colors = {
    SCHEDULED: '#6b7280',   // gray-500
    IN_PROGRESS: '#3b82f6', // blue-500
    COMPLETED: '#10b981',   // emerald-500
    CANCELLED: '#ef4444',   // red-500
    POSTPONED: '#f59e0b',   // amber-500
  };
  
  return colors[status];
};

// Export options for easy access
export const agendaCategories = AgendaCategorySchema.options;
export const agendaPriorities = AgendaPrioritySchema.options;
export const agendaStatuses = AgendaStatusSchema.options;
