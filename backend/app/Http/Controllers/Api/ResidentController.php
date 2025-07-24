<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Schemas\ResidentSchema;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class ResidentController extends Controller
{
    /**
     * Display a listing of residents
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Resident::query();

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('barangay')) {
                $query->where('barangay', $request->barangay);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->search($search);
            }

            // Special classifications filters
            if ($request->boolean('senior_citizen')) {
                $query->seniorCitizens();
            }

            if ($request->boolean('person_with_disability')) {
                $query->pwd();
            }

            if ($request->boolean('four_ps_beneficiary')) {
                $query->fourPs();
            }

            if ($request->boolean('is_household_head')) {
                $query->householdHeads();
            }

            // Age range filter
            if ($request->has('age_from') && $request->has('age_to')) {
                $query->byAgeRange($request->age_from, $request->age_to);
            }

            // Gender filter
            if ($request->has('gender')) {
                $query->byGender($request->gender);
            }

            // Civil status filter
            if ($request->has('civil_status')) {
                $query->byCivilStatus($request->civil_status);
            }

            // Employment status filter
            if ($request->has('employment_status')) {
                $query->byEmploymentStatus($request->employment_status);
            }

            // Voter status filter
            if ($request->has('voter_status')) {
                $query->byVoterStatus($request->voter_status);
            }

            // Include relationships - updated for pivot table approach
            $query->with([
                'households', // pivot relationship
                'createdBy:id,first_name,last_name',
                'updatedBy:id,first_name,last_name'
            ]);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $residents = $query->orderBy('last_name')
                             ->orderBy('first_name')
                             ->paginate($perPage);

            return response()->json($residents);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve residents', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to retrieve residents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resident
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validate using schema rules
            $validatedData = $request->validate(ResidentSchema::getCreateValidationRules());

            // Set created_by if user is authenticated
            if (auth('sanctum')->check()) {
                $validatedData['created_by'] = auth('sanctum')->id();
            }

            // Create the resident
            $resident = Resident::create($validatedData);

            // Load relationships for response
            $resident->load([
                'households',
                'createdBy:id,first_name,last_name'
            ]);

            Log::info('Resident created successfully', ['resident_id' => $resident->id]);

            return response()->json([
                'message' => 'Resident created successfully',
                'data' => $resident
            ], 201);

        } catch (ValidationException $e) {
            Log::warning('Resident creation validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to create resident', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to create resident',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resident
     */
    public function show(Resident $resident): JsonResponse
    {
        try {
            $resident->load([
                'households',
                'householdsAsHead',
                // 'documents',
                // 'complaints',
                // 'suggestions',
                // 'appointments',
                'createdBy:id,first_name,last_name',
                'updatedBy:id,first_name,last_name'
            ]);

            return response()->json([
                'data' => $resident
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve resident', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Failed to retrieve resident',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resident
     */
    public function update(Request $request, Resident $resident): JsonResponse
    {
        try {
            // Validate using schema rules
            $validatedData = $request->validate(ResidentSchema::getUpdateValidationRules());

            // Set updated_by if user is authenticated
            if (auth('sanctum')->check()) {
                $validatedData['updated_by'] = auth('sanctum')->id();
            }

            // Update the resident
            $resident->update($validatedData);

            // Load relationships for response
            $resident->load([
                'households',
                'updatedBy:id,first_name,last_name'
            ]);

            Log::info('Resident updated successfully', ['resident_id' => $resident->id]);

            return response()->json([
                'message' => 'Resident updated successfully',
                'data' => $resident
            ]);

        } catch (ValidationException $e) {
            Log::warning('Resident update validation failed', [
                'resident_id' => $resident->id,
                'errors' => $e->errors()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to update resident', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Failed to update resident',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resident (soft delete)
     */
    public function destroy(Resident $resident): JsonResponse
    {
        try {
            // Remove from any household relationships first
            $resident->leaveHousehold();
            
            // Soft delete by changing status
            $resident->update(['status' => 'INACTIVE']);

            Log::info('Resident deactivated successfully', ['resident_id' => $resident->id]);

            return response()->json([
                'message' => 'Resident deactivated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to deactivate resident', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Failed to deactivate resident',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check for duplicate residents
     */
    public function checkDuplicates(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'first_name' => 'required|string',
                'last_name' => 'required|string',
                'birth_date' => 'required|date'
            ]);

            $duplicates = Resident::where('first_name', 'like', '%' . $request->first_name . '%')
                                ->where('last_name', 'like', '%' . $request->last_name . '%')
                                ->where('birth_date', $request->birth_date)
                                ->where('status', '!=', 'INACTIVE')
                                ->get(['id', 'first_name', 'last_name', 'middle_name', 'birth_date', 'complete_address']);

            return response()->json([
                'data' => $duplicates
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to check duplicates',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get residents statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            // Base query for active residents
            $activeResidents = Resident::active();
            
            // Age group calculations
            $currentDate = now()->format('Y-m-d');
            $ageGroups = [
                'children' => (clone $activeResidents)->where('age', '<', 18)->count(),
                'adults' => (clone $activeResidents)->whereBetween('age', [18, 59])->count(),
                'seniors' => (clone $activeResidents)->where('age', '>=', 60)->count(),
            ];

            // Get employed residents count
            $employedResidents = (clone $activeResidents)->whereIn('employment_status', ['EMPLOYED', 'SELF_EMPLOYED'])->count();

            // Get barangay distribution
            $residentsByBarangay = (clone $activeResidents)
                ->selectRaw('barangay, COUNT(*) as count')
                ->whereNotNull('barangay')
                ->groupBy('barangay')
                ->pluck('count', 'barangay')
                ->toArray();

            // Get civil status distribution  
            $residentsByCivilStatus = (clone $activeResidents)
                ->selectRaw('civil_status, COUNT(*) as count')
                ->whereNotNull('civil_status')
                ->groupBy('civil_status')
                ->pluck('count', 'civil_status')
                ->toArray();

            // Get employment status distribution
            $residentsByEmploymentStatus = (clone $activeResidents)
                ->selectRaw('employment_status, COUNT(*) as count')
                ->whereNotNull('employment_status')
                ->groupBy('employment_status')
                ->pluck('count', 'employment_status')
                ->toArray();

            // Get counts for the main statistics
            $totalResidents = (clone $activeResidents)->count();
            $maleResidents = (clone $activeResidents)->where('gender', 'MALE')->count();
            $femaleResidents = (clone $activeResidents)->where('gender', 'FEMALE')->count();
            $seniorCitizens = (clone $activeResidents)->where('senior_citizen', true)->count();
            $personsWithDisability = (clone $activeResidents)->where('person_with_disability', true)->count();
            $fourPsBeneficiaries = (clone $activeResidents)->where('four_ps_beneficiary', true)->count();
            $indigenousPeople = (clone $activeResidents)->where('indigenous_people', true)->count();
            $householdHeads = (clone $activeResidents)->householdHeads()->count();
            $registeredVoters = (clone $activeResidents)->where('voter_status', 'REGISTERED')->count();

            $stats = [
                'total_residents' => $totalResidents,
                'active_residents' => $totalResidents,
                'inactive_residents' => Resident::inactive()->count(),
                'male_residents' => $maleResidents,
                'female_residents' => $femaleResidents,
                'senior_citizens' => $seniorCitizens,
                'pwd_residents' => $personsWithDisability,
                'four_ps_beneficiaries' => $fourPsBeneficiaries,
                'indigenous_people' => $indigenousPeople,
                'household_heads' => $householdHeads,
                'registered_voters' => $registeredVoters,
                'employed_residents' => $employedResidents,
                
                'by_age_group' => $ageGroups,
                'by_civil_status' => $residentsByCivilStatus,
                'by_employment_status' => $residentsByEmploymentStatus,
                'by_barangay' => $residentsByBarangay,
            ];

            return response()->json([
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get residents statistics', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to get statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get age group statistics with details
     */
    public function ageGroups(): JsonResponse
    {
        try {
            $ageGroups = [
                'children' => Resident::active()->minors()->count(),
                'adults' => Resident::active()->adults()->count(),
                'seniors' => Resident::active()->seniors()->count(),
                'by_age_range' => [
                    '0-4' => Resident::active()->byAgeRange(0, 4)->count(),
                    '5-9' => Resident::active()->byAgeRange(5, 9)->count(),
                    '10-14' => Resident::active()->byAgeRange(10, 14)->count(),
                    '15-19' => Resident::active()->byAgeRange(15, 19)->count(),
                    '20-24' => Resident::active()->byAgeRange(20, 24)->count(),
                    '25-29' => Resident::active()->byAgeRange(25, 29)->count(),
                    '30-34' => Resident::active()->byAgeRange(30, 34)->count(),
                    '35-39' => Resident::active()->byAgeRange(35, 39)->count(),
                    '40-44' => Resident::active()->byAgeRange(40, 44)->count(),
                    '45-49' => Resident::active()->byAgeRange(45, 49)->count(),
                    '50-54' => Resident::active()->byAgeRange(50, 54)->count(),
                    '55-59' => Resident::active()->byAgeRange(55, 59)->count(),
                    '60+' => Resident::active()->where('age', '>=', 60)->count(),
                ]
            ];

            return response()->json([
                'data' => $ageGroups
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get age group statistics', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to get age group statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a deactivated resident
     */
    public function restore(Resident $resident): JsonResponse
    {
        try {
            $resident->activate();

            Log::info('Resident restored successfully', ['resident_id' => $resident->id]);

            return response()->json([
                'message' => 'Resident restored successfully',
                'data' => $resident
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to restore resident', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Failed to restore resident',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Special list endpoints
     */

    /**
     * Get senior citizens
     */
    public function seniorCitizens(Request $request): JsonResponse
    {
        return $this->getSpecialList(
            Resident::active()->seniorCitizens(),
            $request->get('barangay'),
            'senior citizens'
        );
    }

    /**
     * Get persons with disability (PWD)
     */
    public function pwd(Request $request): JsonResponse
    {
        return $this->getSpecialList(
            Resident::active()->pwd(),
            $request->get('barangay'),
            'PWD residents'
        );
    }

    /**
     * Get 4Ps beneficiaries
     */
    public function fourPs(Request $request): JsonResponse
    {
        return $this->getSpecialList(
            Resident::active()->fourPs(),
            $request->get('barangay'),
            '4Ps beneficiaries'
        );
    }

    /**
     * Get household heads
     */
    public function householdHeads(Request $request): JsonResponse
    {
        return $this->getSpecialList(
            Resident::active()->householdHeads(),
            $request->get('barangay'),
            'household heads'
        );
    }

    /**
     * Get indigenous people
     */
    public function indigenous(Request $request): JsonResponse
    {
        return $this->getSpecialList(
            Resident::active()->indigenous(),
            $request->get('barangay'),
            'indigenous people'
        );
    }

    /**
     * Upload profile photo
     */
    public function uploadPhoto(Request $request, Resident $resident): JsonResponse
    {
        try {
            $request->validate([
                'photo' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120' // 5MB max
            ]);

            $photo = $request->file('photo');
            $path = $photo->store('residents/photos', 'public');
            
            $resident->update([
                'profile_photo_url' => asset('storage/' . $path),
                'updated_by' => auth('sanctum')->id()
            ]);

            Log::info('Profile photo uploaded successfully', [
                'resident_id' => $resident->id,
                'photo_path' => $path
            ]);

            return response()->json([
                'message' => 'Profile photo uploaded successfully',
                'data' => $resident
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to upload profile photo', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Failed to upload profile photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method for special lists
     */
    private function getSpecialList($query, ?string $barangay, string $description): JsonResponse
    {
        try {
            if ($barangay) {
                $query->where('barangay', $barangay);
            }

            $residents = $query->with('households')
                              ->orderBy('last_name')
                              ->orderBy('first_name')
                              ->get();

            return response()->json([
                'data' => [
                    'data' => $residents,
                    'count' => $residents->count()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to get {$description}", ['error' => $e->getMessage()]);
            return response()->json([
                'message' => "Failed to get {$description}",
                'error' => $e->getMessage()
            ], 500);
        }
    }
}