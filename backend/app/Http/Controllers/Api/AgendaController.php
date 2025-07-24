<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agenda;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AgendaController extends Controller
{
    /**
     * Get all agendas with pagination and filters
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Agenda::with(['creator', 'updater']);

            // Apply filters
            if ($request->has('category')) {
                $query->byCategory($request->input('category'));
            }

            if ($request->has('priority')) {
                $query->byPriority($request->input('priority'));
            }

            if ($request->has('status')) {
                $query->byStatus($request->input('status'));
            }

            if ($request->has('date_from') && $request->has('date_to')) {
                $query->byDateRange($request->input('date_from'), $request->input('date_to'));
            } elseif ($request->has('date')) {
                $query->byDate($request->input('date'));
            }

            if ($request->has('month') && $request->has('year')) {
                $query->byMonthYear($request->input('month'), $request->input('year'));
            }

            // Search
            if ($request->has('search')) {
                $query->search($request->input('search'));
            }

            // Ordering
            $sortBy = $request->input('sort_by', 'date');
            $sortOrder = $request->input('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // If sorted by date, also sort by time
            if ($sortBy === 'date') {
                $query->orderBy('time', $sortOrder);
            }

            // Pagination
            $perPage = $request->input('per_page', 15);
            $agendas = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Agendas retrieved successfully',
                'data' => $agendas->items(),
                'pagination' => [
                    'current_page' => $agendas->currentPage(),
                    'per_page' => $agendas->perPage(),
                    'total' => $agendas->total(),
                    'last_page' => $agendas->lastPage(),
                    'from' => $agendas->firstItem(),
                    'to' => $agendas->lastItem(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving agendas: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get a specific agenda by ID
     */
    public function show(string $id): JsonResponse
    {
        try {
            $agenda = Agenda::with(['creator', 'updater'])->find($id);

            if (!$agenda) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agenda not found',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Agenda retrieved successfully',
                'data' => $agenda
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving agenda: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Create a new agenda
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), Agenda::getCreateRules());

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $data = $request->all();
            $data['created_by'] = Auth::id();
            $data['updated_by'] = Auth::id();

            $agenda = Agenda::create($data);

            DB::commit();

            // Load relationships for response
            $agenda->load(['creator', 'updater']);

            return response()->json([
                'success' => true,
                'message' => 'Agenda created successfully',
                'data' => $agenda
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error creating agenda: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Update an existing agenda
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $agenda = Agenda::find($id);

            if (!$agenda) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agenda not found',
                    'data' => null
                ], 404);
            }

            $validator = Validator::make($request->all(), Agenda::getUpdateRules());

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $data = $request->all();
            $data['updated_by'] = Auth::id();

            $agenda->update($data);

            DB::commit();

            // Load relationships for response
            $agenda->load(['creator', 'updater']);

            return response()->json([
                'success' => true,
                'message' => 'Agenda updated successfully',
                'data' => $agenda
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error updating agenda: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Update agenda status
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        try {
            $agenda = Agenda::find($id);

            if (!$agenda) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agenda not found',
                    'data' => null
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'status' => ['required', 'string', Rule::in(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'])],
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $data = [
                'status' => $request->input('status'),
                'updated_by' => Auth::id()
            ];

            // Add notes if provided
            if ($request->has('notes')) {
                $data['notes'] = $request->input('notes');
            }

            $agenda->update($data);

            DB::commit();

            // Load relationships for response
            $agenda->load(['creator', 'updater']);

            return response()->json([
                'success' => true,
                'message' => 'Agenda status updated successfully',
                'data' => $agenda
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error updating agenda status: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Delete an agenda
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $agenda = Agenda::find($id);

            if (!$agenda) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agenda not found',
                    'data' => null
                ], 404);
            }

            $agenda->delete();

            return response()->json([
                'success' => true,
                'message' => 'Agenda deleted successfully',
                'data' => null
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting agenda: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get agenda statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $total = Agenda::count();
            $scheduled = Agenda::byStatus('SCHEDULED')->count();
            $inProgress = Agenda::byStatus('IN_PROGRESS')->count();
            $completed = Agenda::byStatus('COMPLETED')->count();
            $cancelled = Agenda::byStatus('CANCELLED')->count();
            $postponed = Agenda::byStatus('POSTPONED')->count();
            
            $today = Agenda::today()->count();
            $upcoming = Agenda::upcoming()->count();
            $overdue = Agenda::overdue()->count();

            // Category breakdown
            $byCategory = Agenda::select('category', DB::raw('count(*) as count'))
                ->groupBy('category')
                ->pluck('count', 'category')
                ->toArray();

            // Priority breakdown
            $byPriority = Agenda::select('priority', DB::raw('count(*) as count'))
                ->groupBy('priority')
                ->pluck('count', 'priority')
                ->toArray();

            // Monthly breakdown (current year)
            $currentYear = now()->year;
            $monthlyData = Agenda::whereYear('date', $currentYear)
                ->select(DB::raw('MONTH(date) as month'), DB::raw('count(*) as count'))
                ->groupBy('month')
                ->pluck('count', 'month')
                ->toArray();

            // Fill missing months with 0
            for ($i = 1; $i <= 12; $i++) {
                if (!isset($monthlyData[$i])) {
                    $monthlyData[$i] = 0;
                }
            }
            ksort($monthlyData);

            return response()->json([
                'success' => true,
                'message' => 'Agenda statistics retrieved successfully',
                'data' => [
                    'total' => $total,
                    'status' => [
                        'scheduled' => $scheduled,
                        'in_progress' => $inProgress,
                        'completed' => $completed,
                        'cancelled' => $cancelled,
                        'postponed' => $postponed,
                    ],
                    'timeline' => [
                        'today' => $today,
                        'upcoming' => $upcoming,
                        'overdue' => $overdue,
                    ],
                    'by_category' => $byCategory,
                    'by_priority' => $byPriority,
                    'monthly' => array_values($monthlyData),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving agenda statistics: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get agendas for calendar view
     */
    public function calendar(Request $request): JsonResponse
    {
        try {
            $query = Agenda::query();

            // Filter by month/year if provided
            if ($request->has('month') && $request->has('year')) {
                $query->byMonthYear($request->input('month'), $request->input('year'));
            } elseif ($request->has('date_from') && $request->has('date_to')) {
                $query->byDateRange($request->input('date_from'), $request->input('date_to'));
            } else {
                // Default to current month
                $query->byMonthYear(now()->month, now()->year);
            }

            $agendas = $query->orderBy('date')->orderBy('time')->get();

            // Transform for calendar display
            $events = $agendas->map(function ($agenda) {
                return [
                    'id' => $agenda->id,
                    'title' => $agenda->title,
                    'date' => $agenda->date,
                    'time' => $agenda->time,
                    'endTime' => $agenda->end_time,
                    'category' => $agenda->category,
                    'priority' => $agenda->priority,
                    'status' => $agenda->status,
                    'color' => $agenda->color,
                    'location' => $agenda->location,
                    'venue' => $agenda->venue,
                    'organizer' => $agenda->organizer,
                    'isToday' => $agenda->is_today,
                    'isUpcoming' => $agenda->is_upcoming,
                    'isOverdue' => $agenda->is_overdue,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Calendar events retrieved successfully',
                'data' => $events
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving calendar events: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get agendas by date range
     */
    public function dateRange(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $agendas = Agenda::with(['creator', 'updater'])
                ->byDateRange($request->input('date_from'), $request->input('date_to'))
                ->orderBy('date')
                ->orderBy('time')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Agendas retrieved successfully',
                'data' => $agendas
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving agendas: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Search agendas
     */
    public function search(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:2',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $agendas = Agenda::with(['creator', 'updater'])
                ->search($request->input('q'))
                ->orderBy('date')
                ->orderBy('time')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Search results retrieved successfully',
                'data' => $agendas
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error searching agendas: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Duplicate an agenda
     */
    public function duplicate(Request $request, string $id): JsonResponse
    {
        try {
            $agenda = Agenda::find($id);

            if (!$agenda) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agenda not found',
                    'data' => null
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'date' => 'nullable|date',
                'time' => 'nullable|date_format:H:i',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $duplicate = $agenda->duplicate(
                $request->input('date'),
                $request->input('time')
            );

            DB::commit();

            // Load relationships for response
            $duplicate->load(['creator', 'updater']);

            return response()->json([
                'success' => true,
                'message' => 'Agenda duplicated successfully',
                'data' => $duplicate
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error duplicating agenda: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Export agendas (placeholder for now)
     */
    public function export(Request $request): JsonResponse
    {
        // This would typically generate a file download
        // For now, just return a success message
        return response()->json([
            'success' => true,
            'message' => 'Export functionality not implemented yet',
            'data' => null
        ], 501);
    }
}
