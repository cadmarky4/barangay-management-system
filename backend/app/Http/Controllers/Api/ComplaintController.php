<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ComplaintController extends Controller
{
    /**
     * View a specific complaint
     */
    public function view(string $id): JsonResponse
    {
        try {
            $complaint = Complaint::with('ticket')
                ->where('base_ticket_id', $id)
                ->first();

            if (!$complaint) {
                return response()->json([
                    'success' => false,
                    'message' => 'Complaint not found',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Complaint retrieved successfully',
                'data' => [
                    'ticket' => $complaint->ticket,
                    'complaint' => $complaint
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving complaint: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Create a new complaint
     */
    public function store(Request $request): JsonResponse
    {
        // Validation rules
        $validator = Validator::make($request->all(), [
            // Ticket fields
            'ticket.subject' => 'required|string|max:255',
            'ticket.description' => 'required|string',
            'ticket.priority' => ['required', Rule::in(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])],
            'ticket.requester_name' => 'nullable|string|max:255',
            'ticket.resident_id' => 'nullable|uuid',
            'ticket.resident_search' => 'nullable|string',
            'ticket.contact_number' => 'nullable|string|size:16',
            'ticket.email_address' => 'nullable|email|max:255',
            'ticket.complete_address' => 'nullable|string|max:255',
            'ticket.category' => 'required|in:COMPLAINT',

            // Complaint fields
            'complaint.c_category' => ['required', Rule::in(Complaint::CATEGORIES)],
            'complaint.department' => ['required', Rule::in(Complaint::DEPARTMENTS)],
            'complaint.location' => 'nullable|string',
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

            // Create ticket
            $ticket = Ticket::create([
                ...$request->input('ticket'),
                'category' => 'COMPLAINT',
                'status' => 'OPEN'
            ]);

            // Create complaint
            $complaintData = $request->input('complaint');
            $complaint = Complaint::create([
                'base_ticket_id' => $ticket->id,
                'c_category' => $complaintData['c_category'],
                'department' => $complaintData['department'],
                'location' => $complaintData['location'] ?? null,
            ]);

            DB::commit();

            // Load relationship for response
            $complaint->load('ticket');

            return response()->json([
                'success' => true,
                'message' => 'Complaint created successfully',
                'data' => [
                    'ticket' => $complaint->ticket,
                    'complaint' => $complaint
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error creating complaint: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Update an existing complaint
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

            $complaint = Complaint::where('base_ticket_id', $id)->first();

            if (!$complaint) {
                return response()->json([
                    'success' => false,
                    'message' => 'Complaint not found',
                    'data' => null
                ], 404);
            }

            // Validation rules for update (all fields are optional)
            $validator = Validator::make($request->all(), [
                // Ticket fields (all optional for update)
                'ticket.subject' => 'sometimes|string|max:255',
                'ticket.description' => 'sometimes|string',
                'ticket.priority' => ['sometimes', Rule::in(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])],
                'ticket.requester_name' => 'nullable|string|max:255',
                'ticket.resident_id' => 'nullable|uuid',
                'ticket.contact_number' => 'nullable|string|size:16',
                'ticket.email_address' => 'nullable|email|max:255',
                'ticket.complete_address' => 'nullable|string|max:255',
                'ticket.status' => ['sometimes', Rule::in(['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'])],

                // Complaint fields (all optional for update)
                'complaint.c_category' => ['sometimes', Rule::in(Complaint::CATEGORIES)],
                'complaint.department' => ['sometimes', Rule::in(Complaint::DEPARTMENTS)],
                'complaint.location' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Update ticket if provided
            if ($request->has('ticket')) {
                $complaint->ticket->update($request->input('ticket'));
            }

            // Update complaint if provided
            if ($request->has('complaint')) {
                $complaint->update($request->input('complaint'));
            }

            DB::commit();

            // Refresh the complaint with updated relationships
            $complaint->load('ticket');

            return response()->json([
                'success' => true,
                'message' => 'Complaint updated successfully',
                'data' => [
                    'ticket' => $complaint->ticket,
                    'complaint' => $complaint
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error updating complaint: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}