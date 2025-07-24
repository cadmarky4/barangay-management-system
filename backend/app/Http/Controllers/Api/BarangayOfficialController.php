<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BarangayOfficial;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class BarangayOfficialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = BarangayOfficial::query();

        // Apply filters
        if ($request->has('position')) {
            $query->where('position', $request->position);
        }

        if ($request->has('committee_assignment')) {
            $query->where('committee_assignment', $request->committee_assignment);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('current_term')) {
            $currentTerm = filter_var($request->current_term, FILTER_VALIDATE_BOOLEAN);
            if ($currentTerm) {
                $query->where('term_start', '<=', now())
                      ->where('term_end', '>=', now());
            }
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('position', 'like', "%{$search}%")
                  ->orWhere('committee_assignment', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'position');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $officials = $query->with('resident')->paginate($request->get('per_page', 15));

        // Return Laravel pagination structure directly (frontend expects this format)
        return response()->json($officials);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // Transform frontend data format if needed
        $requestData = $this->transformFrontendToBackend($request->all());
        
        $validator = Validator::make($requestData, [
            'prefix' => 'nullable|string|in:Mr.,Ms.,Mrs.,Dr.,Hon.',
            'resident_id' => 'required|string|uuid|exists:residents,id',
            
            // Position Information
            'position' => 'required|in:BARANGAY_CAPTAIN,BARANGAY_SECRETARY,BARANGAY_TREASURER,KAGAWAD,SK_CHAIRPERSON,SK_KAGAWAD,BARANGAY_CLERK,BARANGAY_TANOD',
            'committee_assignment' => 'nullable|in:Health,Education,Public Safety,Environment,Peace and Order,Sports and Recreation,Women and Family,Senior Citizens',
            
            // Term Information
            'term_start' => 'required|date',
            'term_end' => 'required|date|after:term_start',
            'term_number' => 'nullable|integer',
            'is_current_term' => 'nullable|boolean',
            
            // Status
            'status' => 'nullable|in:ACTIVE,INACTIVE,SUSPENDED,RESIGNED,TERMINATED,DECEASED',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        // Set default status if not provided
        if (!isset($validated['status'])) {
            $validated['status'] = 'ACTIVE';
        }

        $official = BarangayOfficial::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Barangay official created successfully',
            'data' => $official->load('resident')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(BarangayOfficial $barangayOfficial): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $barangayOfficial->load('resident')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BarangayOfficial $barangayOfficial): JsonResponse
    {
        // Transform frontend data format if needed
        $requestData = $this->transformFrontendToBackend($request->all());
        
        $validator = Validator::make($requestData, [
            'prefix' => 'nullable|string|in:Mr.,Ms.,Mrs.,Dr.,Hon.',
            'resident_id' => 'sometimes|string|uuid|exists:residents,id',
            
            // Position Information
            'position' => 'sometimes|in:BARANGAY_CAPTAIN,BARANGAY_SECRETARY,BARANGAY_TREASURER,KAGAWAD,SK_CHAIRPERSON,SK_KAGAWAD,BARANGAY_CLERK,BARANGAY_TANOD',
            'committee_assignment' => 'nullable|in:Health,Education,Public Safety,Environment,Peace and Order,Sports and Recreation,Women and Family,Senior Citizens',
            
            // Term Information
            'term_start' => 'sometimes|date',
            'term_end' => 'sometimes|date|after:term_start',
            'term_number' => 'nullable|integer|min:1',
            'is_current_term' => 'nullable|boolean',
            
            // Status
            'status' => 'sometimes|in:ACTIVE,INACTIVE,SUSPENDED,RESIGNED,TERMINATED,DECEASED',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        $barangayOfficial->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Barangay official updated successfully',
            'data' => $barangayOfficial->load('resident')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BarangayOfficial $barangayOfficial): JsonResponse
    {
        $barangayOfficial->delete();

        return response()->json([
            'success' => true,
            'message' => 'Barangay official deleted successfully'
        ]);
    }

    /**
     * Check if a resident is already registered as a barangay official
     */
    public function checkDuplicate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'residentId' => 'required|string|uuid',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $residentId = $request->residentId;
        
        // Count how many times this resident is registered as an official
        $count = BarangayOfficial::where('resident_id', $residentId)->count();

        return response()->json([
            'success' => true,
            'data' => $count
        ]);
    }

    /**
     * Get active officials
     */
    public function getActiveOfficials(): JsonResponse
    {
        $officials = BarangayOfficial::where('status', 'ACTIVE')
            ->where('term_start', '<=', now())
            ->where('term_end', '>=', now())
            ->with('resident')
            ->orderBy('position')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $officials
        ]);
    }

    /**
     * Get officials by position
     */
    public function getByPosition(Request $request, string $position): JsonResponse
    {
        $officials = BarangayOfficial::where('position', strtoupper($position))
            ->when($request->get('active_only'), function ($query) {
                $query->where('status', 'ACTIVE')
                      ->where('term_start', '<=', now())
                      ->where('term_end', '>=', now());
            })
            ->with('resident')
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $officials
        ]);
    }

    /**
     * Get officials by committee
     */
    public function getByCommittee(Request $request, string $committee): JsonResponse
    {
        $officials = BarangayOfficial::where('committee_assignment', $committee)
            ->when($request->get('active_only'), function ($query) {
                $query->where('status', 'ACTIVE')
                      ->where('term_start', '<=', now())
                      ->where('term_end', '>=', now());
            })
            ->with('resident')
            ->orderBy('position')
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $officials
        ]);
    }

    /**
     * Archive official (end term)
     */
    public function archive(Request $request, BarangayOfficial $barangayOfficial): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:INACTIVE,SUSPENDED,RESIGNED,TERMINATED,DECEASED',
            'effective_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $barangayOfficial->update([
            'status' => $request->status,
            'term_end' => $request->effective_date,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Official archived successfully',
            'data' => $barangayOfficial->load('resident')
        ]);
    }

    /**
     * Reactivate official
     */
    public function reactivate(Request $request, BarangayOfficial $barangayOfficial): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'new_term_start' => 'required|date',
            'new_term_end' => 'required|date|after:new_term_start',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $barangayOfficial->update([
            'status' => 'ACTIVE',
            'term_start' => $request->new_term_start,
            'term_end' => $request->new_term_end,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Official reactivated successfully',
            'data' => $barangayOfficial->load('resident')
        ]);
    }

    /**
     * Get official statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_officials' => BarangayOfficial::count(),
            'active_officials' => BarangayOfficial::where('status', 'ACTIVE')->count(),
            'current_term_officials' => BarangayOfficial::where('term_start', '<=', now())
                ->where('term_end', '>=', now())
                ->count(),
            'by_position' => BarangayOfficial::selectRaw('position, COUNT(*) as count')
                ->where('status', 'ACTIVE')
                ->groupBy('position')
                ->pluck('count', 'position'),
            'by_status' => BarangayOfficial::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'by_committee' => BarangayOfficial::selectRaw('committee_assignment, COUNT(*) as count')
                ->where('status', 'ACTIVE')
                ->whereNotNull('committee_assignment')
                ->groupBy('committee_assignment')
                ->pluck('count', 'committee_assignment'),
            'upcoming_term_endings' => BarangayOfficial::where('status', 'ACTIVE')
                ->where('term_end', '<=', now()->addMonths(6))
                ->where('term_end', '>=', now())
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Export officials data
     */
    public function export(Request $request): JsonResponse
    {
        $query = BarangayOfficial::query()->with('resident');

        // Apply same filters as index
        if ($request->has('position')) {
            $query->where('position', $request->position);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $officials = $query->orderBy('position')->orderBy('created_at')->get();

        // Format data for export
        $exportData = $officials->map(function ($official) {
            return [
                'prefix' => $official->prefix,
                'full_name' => $official->resident ? $official->resident->full_name : '',
                'position' => $official->position,
                'committee_assignment' => $official->committee_assignment,
                'term_start' => $official->term_start,
                'term_end' => $official->term_end,
                'term_number' => $official->term_number,
                'is_current_term' => $official->is_current_term ? 'Yes' : 'No',
                'status' => $official->status,
                'created_at' => $official->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $official->updated_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $exportData,
            'filename' => 'barangay_officials_' . now()->format('Y_m_d_H_i_s') . '.csv'
        ]);
    }

    /**
     * Transform frontend form data to backend API format
     */
    private function transformFrontendToBackend(array $data): array
    {
        $transformed = [];
        
        // Map frontend field names to backend field names
        $fieldMapping = [
            'residentId' => 'resident_id',
            'committeeAssignment' => 'committee_assignment',
            'termStart' => 'term_start',
            'termEnd' => 'term_end',
            'termNumber' => 'term_number',
            'isCurrentTerm' => 'is_current_term',
        ];
        
        // Transform field names
        foreach ($data as $key => $value) {
            $backendKey = $fieldMapping[$key] ?? $key;
            $transformed[$backendKey] = $value;
        }
        
        // Set defaults
        if (!isset($transformed['status'])) {
            $transformed['status'] = 'ACTIVE';
        }
        
        return $transformed;
    }
}