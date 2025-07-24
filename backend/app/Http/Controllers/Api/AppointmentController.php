<?php

// app/Http/Controllers/AppointmentController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;


class AppointmentController extends Controller
{
    /**
     * View a specific appointment with its ticket details
     */
    public function view(string $id): JsonResponse
    {
        try {
            // Find appointment without eager loading the ticket relationship
            $appointment = Appointment::with(['ticket'])
                ->where('base_ticket_id', $id)
                ->first();

            if (!$appointment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appointment not found',
                    'data' => null
                ], 404);
            }

            // // Get the ticket (this triggers lazy loading)
            // $ticket = $appointment->ticket;

            // if (!$ticket) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Related ticket not found',
            //         'data' => null
            //     ], 404);
            // }

            // // Remove the ticket relation from the appointment to prevent nesting
            // $appointment->unsetRelation('ticket');

            return response()->json([
                'success' => true,
                'message' => 'Appointment retrieved successfully',
                'data' => [
                    'ticket' => $appointment->ticket,
                    'appointment' => $appointment
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving appointment: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Create a new appointment with ticket
     */
    public function store(Request $request): JsonResponse
    {
        // Validation rules
        $validator = Validator::make($request->all(), [
            'ticket.subject' => 'required|string|max:255',
            'ticket.description' => 'required|string',
            'ticket.priority' => ['required', Rule::in(Ticket::PRIORITIES)],
            'ticket.requester_name' => 'required|string|max:255',
            'ticket.resident_id' => 'nullable|string|uuid|exists:residents,id',
            'ticket.contact_number' => 'nullable|string|max:20',
            'ticket.email_address' => 'nullable|email|max:255',
            'ticket.complete_address' => 'nullable|string|max:255',
            'appointment.department' => ['required', Rule::in(Appointment::DEPARTMENTS)],
            'appointment.date' => 'required|date|after_or_equal:today',
            'appointment.time' => 'required|date_format:H:i',
            'appointment.additional_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Check if the schedule is available
            $isOccupied = Appointment::byDateAndTime(
                $request->input('appointment.date'),
                $request->input('appointment.time')
            )->byDepartment($request->input('appointment.department'))->exists();

            Log::info("Checking availability for {$request->input('appointment.date')} {$request->input('appointment.time')} in {$request->input('appointment.department')}");

            if ($isOccupied) {
                return response()->json([
                    'success' => false,
                    'message' => 'The selected date and time slot is already booked for this department',
                    'data' => null
                ], 409);
            }

            // Create ticket first
            $ticket = Ticket::create([
                ...$request->input('ticket'),
                'category' => 'APPOINTMENT',
                'status' => 'OPEN'
            ]);

            // Create appointment
            $appointment = Appointment::create([
                'base_ticket_id' => $ticket->id,
                ...$request->input('appointment')
            ]);

            DB::commit();

            // Load the relationship for response
            $appointment->load('ticket');

            return response()->json([
                'success' => true,
                'message' => 'Appointment created successfully',
                'data' => $appointment
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error creating appointment: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Update an existing appointment
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            // First, find the ticket by its ID
            $ticket = Ticket::find($id);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found',
                    'data' => null
                ], 404);
            }

            // Second, find the appointment that belongs to this ticket
            $appointment = Appointment::where('base_ticket_id', $id)->first();

            if (!$appointment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appointment not found for this ticket',
                    'data' => null
                ], 404);
            }

            // Validation rules for update (all fields are optional)
            $validator = Validator::make($request->all(), [
                'ticket.subject' => 'sometimes|string|max:255',
                'ticket.description' => 'sometimes|string',
                'ticket.priority' => ['sometimes', Rule::in(Ticket::PRIORITIES)],
                'ticket.requester_name' => 'sometimes|string|max:255',
                'ticket.resident_id' => 'nullable|string|uuid|exists:residents,id',
                'ticket.contact_number' => 'nullable|string|max:20',
                'ticket.email_address' => 'nullable|email|max:255',
                'ticket.complete_address' => 'nullable|string|max:255',
                'ticket.status' => ['sometimes', Rule::in(Ticket::STATUSES)],
                'appointment.department' => ['sometimes', Rule::in(Appointment::DEPARTMENTS)],
                'appointment.date' => 'sometimes|date|after_or_equal:today',
                'appointment.time' => 'sometimes|date_format:H:i',
                'appointment.additional_notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Check for schedule conflicts if date/time is being updated
            if ($request->has('appointment.date') || $request->has('appointment.time') || $request->has('appointment.department')) {
                $newDate = $request->input('appointment.date', $appointment->date);
                $newTime = $request->input('appointment.time', $appointment->time);
                $newDepartment = $request->input('appointment.department', $appointment->department);

                $isOccupied = Appointment::byDateAndTime($newDate, $newTime)
                    ->byDepartment($newDepartment)
                    ->where('id', '!=', $appointment->id)
                    ->exists();

                if ($isOccupied) {
                    return response()->json([
                        'success' => false,
                        'message' => 'The selected date and time slot is already booked for this department',
                        'data' => null
                    ], 409);
                }
            }

            // Update ticket if ticket data is provided
            if ($request->has('ticket')) {
                $ticket->update($request->input('ticket'));
            }

            // Update appointment if appointment data is provided
            if ($request->has('appointment')) {
                $appointment->update($request->input('appointment'));
            }

            DB::commit();

            // Load the ticket relationship for the response
            $appointment->load('ticket');

            return response()->json([
                'success' => true,
                'message' => 'Appointment updated successfully',
                'data' => $appointment
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error updating appointment: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Check if a schedule is vacant
     */
    public function checkScheduleVacancy(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'time' => 'required|date_format:H:i',
            'department' => ['sometimes', Rule::in(Appointment::DEPARTMENTS)],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $query = Appointment::byDateAndTime(
                $request->input('date'),
                $request->input('time')
            );

            // If department is specified, check for that specific department
            if ($request->has('department')) {
                $query->byDepartment($request->input('department'));
            }

            $isOccupied = $query->exists();
            $isVacant = !$isOccupied;

            return response()->json([
                'success' => true,
                'message' => 'Schedule availability checked successfully',
                'data' => $isVacant
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking schedule availability: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get all appointments (with optional filters)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Appointment::with('ticket');

            // Apply filters if provided
            if ($request->has('department')) {
                $query->byDepartment($request->input('department'));
            }

            if ($request->has('date')) {
                $query->where('date', $request->input('date'));
            }

            if ($request->has('status')) {
                $query->whereHas('ticket', function ($q) use ($request) {
                    $q->byStatus($request->input('status'));
                });
            }

            // Pagination
            $perPage = $request->input('per_page', 15);
            $appointments = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Appointments retrieved successfully',
                'data' => $appointments
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving appointments: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}