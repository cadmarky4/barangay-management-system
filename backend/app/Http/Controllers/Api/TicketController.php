<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\Builder;

class TicketController extends Controller
{
    /**
     * Display a listing of tickets with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        // Validate query parameters
        $validator = Validator::make($request->all(), [
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'category' => Rule::in(Ticket::CATEGORIES),
            'priority' => Rule::in(Ticket::PRIORITIES),
            'status' => Rule::in(Ticket::STATUSES),
            'search' => 'string|max:255',
            'sort_by' => 'string|in:created_at,updated_at,priority,status,category,subject',
            'sort_order' => 'string|in:asc,desc',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Ticket::query();

        // Apply filters
        if ($request->has('category') && $request->category !== '') {
            $query->byCategory($request->category);
        }

        if ($request->has('priority') && $request->priority !== '') {
            $query->where('priority', $request->priority);
        }

        if ($request->has('status') && $request->status !== '') {
            $query->byStatus($request->status);
        }

        // Apply search
        if ($request->has('search') && $request->search !== '') {
            $searchTerm = $request->search;
            $query->where(function (Builder $q) use ($searchTerm) {
                $q->where('subject', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")
                    ->orWhere('requester_name', 'like', "%{$searchTerm}%")
                    ->orWhere('ticket_number', 'like', "%{$searchTerm}%")
                    ->orWhere('contact_number', 'like', "%{$searchTerm}%")
                    ->orWhere('email_address', 'like', "%{$searchTerm}%");
            });
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate results
        $perPage = $request->get('per_page', 15);
        $tickets = $query->paginate($perPage);

        return response()->json([
            'data' => $tickets->items(),
            'current_page' => $tickets->currentPage(),
            'last_page' => $tickets->lastPage(),
            'per_page' => $tickets->perPage(),
            'total' => $tickets->total(),
            'first_page_url' => $tickets->url(1),
            'from' => $tickets->firstItem(),
            'last_page_url' => $tickets->url($tickets->lastPage()),
            'links' => $tickets->linkCollection()->toArray(),
            'next_page_url' => $tickets->nextPageUrl(),
            'path' => $tickets->path(),
            'prev_page_url' => $tickets->previousPageUrl(),
            'to' => $tickets->lastItem(),
        ]);
    }

    // public function index(Request $request): JsonResponse
    // {
    //     // Validate query parameters
    //     $validator = Validator::make($request->all(), [
    //         'page' => 'integer|min:1',
    //         'per_page' => 'integer|min:1|max:100',
    //         'category' => Rule::in(Ticket::CATEGORIES),
    //         'priority' => Rule::in(Ticket::PRIORITIES),
    //         'status' => Rule::in(Ticket::STATUSES),
    //         'search' => 'string|max:255',
    //         'sort_by' => 'string|in:created_at,updated_at,priority,status,category,subject',
    //         'sort_order' => 'string|in:asc,desc',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Validation failed',
    //             'errors' => $validator->errors()
    //         ], 422);
    //     }

    //     $query = Ticket::query();

    //     // Apply filters
    //     if ($request->has('category') && $request->category !== '') {
    //         $query->byCategory($request->category);
    //     }

    //     if ($request->has('priority') && $request->priority !== '') {
    //         $query->where('priority', $request->priority);
    //     }

    //     if ($request->has('status') && $request->status !== '') {
    //         $query->byStatus($request->status);
    //     }

    //     // Apply search
    //     if ($request->has('search') && $request->search !== '') {
    //         $searchTerm = $request->search;
    //         $query->where(function (Builder $q) use ($searchTerm) {
    //             $q->where('subject', 'like', "%{$searchTerm}%")
    //                 ->orWhere('description', 'like', "%{$searchTerm}%")
    //                 ->orWhere('requester_name', 'like', "%{$searchTerm}%")
    //                 ->orWhere('ticket_number', 'like', "%{$searchTerm}%")
    //                 ->orWhere('contact_number', 'like', "%{$searchTerm}%")
    //                 ->orWhere('email_address', 'like', "%{$searchTerm}%");
    //         });
    //     }

    //     // Apply sorting
    //     $sortBy = $request->get('sort_by', 'created_at');
    //     $sortOrder = $request->get('sort_order', 'desc');
    //     $query->orderBy($sortBy, $sortOrder);

    //     // Paginate results
    //     $perPage = $request->get('per_page', 15);
    //     $tickets = $query->paginate($perPage);

    //     return response()->json([
    //         'success' => true,
    //         'data' => $tickets->items(),
    //         'pagination' => [
    //             'current_page' => $tickets->currentPage(),
    //             'per_page' => $tickets->perPage(),
    //             'total' => $tickets->total(),
    //             'last_page' => $tickets->lastPage(),
    //             'from' => $tickets->firstItem(),
    //             'to' => $tickets->lastItem(),
    //             'has_more_pages' => $tickets->hasMorePages(),
    //         ]
    //     ]);
    // }

    /**
     * Get help desk statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $statistics = [
                'total_tickets' => Ticket::count(),
                'pending_review' => Ticket::where('status', 'OPEN')->count(),
                'in_progress' => Ticket::where('status', 'IN_PROGRESS')->count(),
                'resolved' => Ticket::where('status', 'RESOLVED')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $statistics
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified ticket from storage
     */
    public function destroy(string $id): JsonResponse
    {
        // Validate UUID format
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid ticket ID format'
            ], 400);
        }

        try {
            $ticket = Ticket::findOrFail($id);

            // Check if ticket can be deleted (optional business logic)
            // if (in_array($ticket->status, ['IN_PROGRESS', 'PENDING'])) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Cannot delete ticket that is currently in progress or pending'
            //     ], 409);
            // }

            $ticket->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ticket deleted successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}