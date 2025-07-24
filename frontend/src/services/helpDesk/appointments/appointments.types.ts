import { z } from "zod";
import { DepartmentSchema } from "@/services/users/users.types";
import { BaseTicketSchema, TimeSlotsSchema } from "../helpDesk.type";
import { timeSlotOptions } from "../helpDesk.type";

// Regex for MM-DD-YYYY (allows valid month/day combos but not fully exhaustive)
const regex = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
;

export const BookedScheduleSchema = z.object({
  appointment_id: z.string().uuid(),
  date: z.string().min(1, 'helpDesk.appointmentsForm.validation.dateRequired'),
  time: TimeSlotsSchema,
  department: DepartmentSchema,
})

export const CheckScheduleAvailabilitySchema = BookedScheduleSchema.omit({
  appointment_id: true, // not really needed for checking as booked schedules will be unavailable everywhere (for now)
})

export const AppointmentSchema = z.object({
  id: z.string().uuid().optional(), // PK, will be generated on the server-side
  base_ticket_id: z.string().uuid(), // FK, MUST BE UNIQUE
  department: z.enum(DepartmentSchema.options, {
    errorMap: (_, __) => ({ message: 'helpDesk.appointmentsForm.validation.invalidDepartment' })
  }),
  // date: z.string().min(1, 'helpDesk.appointmentsForm.validation.dateRequired'),
 
  date: z.string()
    .regex(regex, { message: 'helpDesk.appointmentsForm.validation.dateInMM/DD/YYYY' })
    .refine((str) => {
      const [yyyy, mm, dd] = str.split("-").map(Number);
      const date = new Date(yyyy, mm - 1, dd);
      const today = new Date();
      today.setHours(0,0,0,0);
      return date >= today;
    }, { message: 'helpDesk.appointmentsForm.validation.dateNotInThePast' }),

  time: z.enum(timeSlotOptions, {
    errorMap: (_, __) => ({ message: 'helpDesk.validation.invalidTimeSlots' })
  }),
  additional_notes: z.string().optional().nullable(),
})

export const ViewAppointmentSchema = z.object({
  ticket: BaseTicketSchema,
  appointment: AppointmentSchema,
})

export const CreateAppointmentSchema = z.object({
  ticket: BaseTicketSchema.omit({
    id: true, // AUTO GENERATED
    ticket_number: true, // AUTO GENERATED
    created_at: true, // AUTO GENERATED
    updated_at: true, // AUTO GENERATED
    status: true, // DEFAULTS TO 'OPEN'
  }).extend({
    resident_search: z.string().optional().nullable(),
    category: z.literal('APPOINTMENT')
  }),

  appointment: AppointmentSchema.omit({
    id: true, // AUTO GENERATED
    base_ticket_id: true, // AUTO GENERATED
  })
})

export const EditAppointmentSchema = z.object({
  ticket: BaseTicketSchema.partial().omit({
    id: true,           // Cannot change ID
    ticket_number: true, // Cannot change ticket number
    created_at: true,   // Cannot change creation date
    updated_at: true, // AUTO GENERATED
    category: true      // Cannot change category type
  }).extend({
    resident_search: z.string().optional().nullable(),
  }),

  appointment: AppointmentSchema.partial().omit({ 
    id: true,        // Cannot change ID
    base_ticket_id: true  // Cannot change parent ticket reference
  })
})

export type BookedSchedule = z.infer<typeof BookedScheduleSchema>
export type Appointment = z.infer<typeof AppointmentSchema>
export type ViewAppointment = z.infer<typeof ViewAppointmentSchema>
export type CreateAppointment = z.infer<typeof CreateAppointmentSchema>
export type EditAppointment = z.infer<typeof EditAppointmentSchema>
export type CheckScheduleAvailability = z.infer<typeof CheckScheduleAvailabilitySchema>

export const departments = DepartmentSchema.options;