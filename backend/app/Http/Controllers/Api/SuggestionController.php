<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Suggestion;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class SuggestionController extends Controller
{
    /**
     * View a specific suggestion
     */
    public function view(string $id): JsonResponse
    {
        try {
            $suggestion = Suggestion::with('ticket')
                ->where('base_ticket_id', $id)
                ->first();

            if (!$suggestion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Suggestion not found',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Suggestion retrieved successfully',
                'data' => [
                    'ticket' => $suggestion->ticket,
                    'suggestion' => $suggestion
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving suggestion: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Create a new suggestion
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
            'ticket.category' => 'required|in:SUGGESTION',

            // Suggestion fields
            'suggestion.s_category' => ['required', Rule::in(Suggestion::CATEGORIES)],
            'suggestion.expected_benefits' => 'nullable|string',
            'suggestion.implementation_ideas' => 'nullable|string',
            'suggestion.resources_needed' => 'nullable|string',
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
                'category' => 'SUGGESTION',
                'status' => 'OPEN'
            ]);

            // Create suggestion
            $suggestionData = $request->input('suggestion');
            $suggestion = Suggestion::create([
                'base_ticket_id' => $ticket->id,
                's_category' => $suggestionData['s_category'],
                'expected_benefits' => $suggestionData['expected_benefits'] ?? null,
                'implementation_ideas' => $suggestionData['implementation_ideas'] ?? null,
                'resources_needed' => $suggestionData['resources_needed'] ?? null,
            ]);

            DB::commit();

            // Load relationship for response
            $suggestion->load('ticket');

            return response()->json([
                'success' => true,
                'message' => 'Suggestion created successfully',
                'data' => [
                    'ticket' => $suggestion->ticket,
                    'suggestion' => $suggestion
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error creating suggestion: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Update an existing suggestion
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
            $suggestion = Suggestion::where('base_ticket_id', $id)->first();

            if (!$suggestion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Suggestion not found',
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

                // Suggestion fields (all optional for update)
                'suggestion.s_category' => ['sometimes', Rule::in(Suggestion::CATEGORIES)],
                'suggestion.expected_benefits' => 'nullable|string',
                'suggestion.implementation_ideas' => 'nullable|string',
                'suggestion.resources_needed' => 'nullable|string',
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
                $suggestion->ticket->update($request->input('ticket'));
            }

            // Update suggestion if provided
            if ($request->has('suggestion')) {
                $suggestion->update($request->input('suggestion'));
            }

            DB::commit();

            // Refresh the suggestion with updated relationships
            $suggestion->load('ticket');

            return response()->json([
                'success' => true,
                'message' => 'Suggestion updated successfully',
                'data' => [
                    'ticket' => $suggestion->ticket,
                    'suggestion' => $suggestion
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error updating suggestion: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}