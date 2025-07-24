<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blotter;
use App\Models\OtherPersonInvolved;
use App\Models\SupportingDocument;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class BlotterController extends Controller
{
    /**
     * View a specific blotter
     */
    public function view(string $id): JsonResponse
    {
        try {
            $blotter = Blotter::with(['ticket', 'otherPeopleInvolved', 'supportingDocuments'])
                ->where('base_ticket_id', $id)
                ->first();

            if (!$blotter) {
                return response()->json([
                    'success' => false,
                    'message' => 'Blotter not found',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Blotter retrieved successfully',
                'data' => [
                    'ticket' => $blotter->ticket,
                    'blotter' => $blotter
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving blotter: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Create a new blotter
     */
    public function store(Request $request): JsonResponse
    {
        // Validation rules
        $validator = Validator::make($request->all(), [
            // Ticket fields
            'ticket.subject' => 'required|string|max:255',
            'ticket.description' => 'required|string',
            'ticket.priority' => ['required', Rule::in(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])],
            'ticket.requester_name' => 'required|string|max:255',
            'ticket.resident_id' => 'nullable|uuid',
            'ticket.resident_search' => 'nullable|string',
            'ticket.contact_number' => 'required|string|size:16',
            'ticket.email_address' => 'nullable|email|max:255',
            'ticket.complete_address' => 'required|string|max:255',
            'ticket.category' => 'required|in:BLOTTER',

            // Blotter fields
            'blotter.type_of_incident' => [
                'required',
                Rule::in([
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
                ])
            ],
            'blotter.date_of_incident' => 'required|date_format:Y-m-d',
            'blotter.time_of_incident' => [
                'required',
                Rule::in([
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
            ],
            'blotter.location_of_incident' => 'required|string',

            // Other people involved
            'blotter.other_people_involved' => 'nullable|array',
            'blotter.other_people_involved.*.full_name' => 'required|string|max:255',
            'blotter.other_people_involved.*.address' => 'nullable|string|max:255',
            'blotter.other_people_involved.*.contact_number' => 'required|string|size:16',
            'blotter.other_people_involved.*.involvement' => [
                'required',
                Rule::in([
                    'RESPONDENT',
                    'WITNESS',
                    'VICTIM',
                    'SUSPECT'
                ])
            ],

            // Supporting documents
            'blotter.supporting_documents' => 'nullable|array',
            'blotter.supporting_documents.*.url' => 'required|string',
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
                'category' => 'BLOTTER',
                'status' => 'OPEN'
            ]);

            // Create blotter
            $blotterData = $request->input('blotter');
            $blotter = Blotter::create([
                'base_ticket_id' => $ticket->id,
                'type_of_incident' => $blotterData['type_of_incident'],
                'date_of_incident' => $blotterData['date_of_incident'],
                'time_of_incident' => $blotterData['time_of_incident'],
                'location_of_incident' => $blotterData['location_of_incident'],
            ]);

            // Create other people involved records
            if (!empty($blotterData['other_people_involved'])) {
                foreach ($blotterData['other_people_involved'] as $person) {
                    OtherPersonInvolved::create([
                        'blotter_id' => $blotter->id,
                        ...$person
                    ]);
                }
            }

            // Create supporting documents records
            if (!empty($blotterData['supporting_documents'])) {
                foreach ($blotterData['supporting_documents'] as $document) {
                    SupportingDocument::create([
                        'blotter_id' => $blotter->id,
                        'url' => $document['url']
                    ]);
                }
            }

            DB::commit();

            // Load relationships for response
            $blotter->load(['ticket', 'otherPeopleInvolved', 'supportingDocuments']);

            return response()->json([
                'success' => true,
                'message' => 'Blotter created successfully',
                'data' => [
                    'ticket' => $blotter->ticket,
                    'blotter' => $blotter
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error creating blotter: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Update an existing blotter
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
            $blotter = Blotter::where('base_ticket_id', $id)->first();

            if (!$blotter) {
                return response()->json([
                    'success' => false,
                    'message' => 'Blotter not found',
                    'data' => null
                ], 404);
            }

            // Validation rules for update (all fields are optional)
            $validator = Validator::make($request->all(), [
                // Ticket fields (all optional for update)
                'ticket.subject' => 'sometimes|string|max:255',
                'ticket.description' => 'sometimes|string',
                'ticket.priority' => ['sometimes', Rule::in(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])],
                'ticket.requester_name' => 'sometimes|string|max:255',
                'ticket.resident_id' => 'nullable|uuid',
                'ticket.contact_number' => 'sometimes|string|size:16',
                'ticket.email_address' => 'nullable|email|max:255',
                'ticket.complete_address' => 'sometimes|string|max:255',
                'ticket.status' => ['sometimes', Rule::in(['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'])],

                // Blotter fields (all optional for update)
                'blotter.type_of_incident' => [
                    'sometimes',
                    Rule::in([
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
                    ])
                ],
                'blotter.date_of_incident' => 'sometimes|date_format:Y-m-d',
                'blotter.time_of_incident' => [
                    'sometimes',
                    Rule::in([
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
                ],
                'blotter.location_of_incident' => 'sometimes|string',

                // Other people involved
                'blotter.other_people_involved' => 'nullable|array',
                'blotter.other_people_involved.*.full_name' => 'required|string|max:255',
                'blotter.other_people_involved.*.address' => 'nullable|string|max:255',
                'blotter.other_people_involved.*.contact_number' => 'required|string|size:16',
                'blotter.other_people_involved.*.involvement' => [
                    'required',
                    Rule::in([
                        'RESPONDENT',
                        'WITNESS',
                        'VICTIM',
                        'SUSPECT'
                    ])
                ],

                // Supporting documents
                'blotter.supporting_documents' => 'nullable|array',
                'blotter.supporting_documents.*.url' => 'required|string',
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
                $blotter->ticket->update($request->input('ticket'));
            }

            // Update blotter if provided
            if ($request->has('blotter')) {
                $blotterData = $request->input('blotter');

                // Update blotter fields
                $blotter->update([
                    'type_of_incident' => $blotterData['type_of_incident'] ?? $blotter->type_of_incident,
                    'date_of_incident' => $blotterData['date_of_incident'] ?? $blotter->date_of_incident,
                    'time_of_incident' => $blotterData['time_of_incident'] ?? $blotter->time_of_incident,
                    'location_of_incident' => $blotterData['location_of_incident'] ?? $blotter->location_of_incident,
                ]);

                // Handle other people involved
                if (array_key_exists('other_people_involved', $blotterData)) {
                    // Delete existing records
                    $blotter->otherPeopleInvolved()->delete();

                    // Create new records
                    if (!empty($blotterData['other_people_involved'])) {
                        foreach ($blotterData['other_people_involved'] as $person) {
                            OtherPersonInvolved::create([
                                'blotter_id' => $blotter->id,
                                ...$person
                            ]);
                        }
                    }
                }

                // Handle supporting documents
                if (array_key_exists('supporting_documents', $blotterData)) {
                    // Delete existing records
                    $blotter->supportingDocuments()->delete();

                    // Create new records
                    if (!empty($blotterData['supporting_documents'])) {
                        foreach ($blotterData['supporting_documents'] as $document) {
                            SupportingDocument::create([
                                'blotter_id' => $blotter->id,
                                'url' => $document['url']
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            // Refresh the blotter with updated relationships
            $blotter->load(['ticket', 'otherPeopleInvolved', 'supportingDocuments']);

            return response()->json([
                'success' => true,
                'message' => 'Blotter updated successfully',
                'data' => [
                    'ticket' => $blotter->ticket,
                    'blotter' => $blotter
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error updating blotter: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Upload supporting document
     */
    public function uploadPhoto(Request $request, string $blotterId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'photo' => 'required|file|max:5120|mimes:jpeg,png,gif,pdf',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $blotter = Blotter::find($blotterId);

            if (!$blotter) {
                return response()->json([
                    'success' => false,
                    'message' => 'Blotter not found',
                    'data' => null
                ], 404);
            }

            // Store the file
            $file = $request->file('photo');
            $path = $file->store('blotter-documents', 'public');
            $url = Storage::url($path);

            // Create supporting document record
            SupportingDocument::create([
                'blotter_id' => $blotter->id,
                'url' => $url
            ]);

            // Load relationships for response
            $blotter->load(['ticket', 'otherPeopleInvolved', 'supportingDocuments']);

            return response()->json([
                'success' => true,
                'message' => 'Supporting document uploaded successfully',
                'data' => [
                    'ticket' => $blotter->ticket,
                    'blotter' => $blotter
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading supporting document: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}