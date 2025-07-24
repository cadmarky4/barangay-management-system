<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\Resident;
use App\Models\Household;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ImportController extends Controller
{
    /**
     * Import residents from Excel file
     */
    public function importResidents(Request $request): JsonResponse
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:xlsx,xls|max:10240',
                'skipHeader' => 'sometimes|boolean',
                'validateOnly' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('file');
            $skipHeader = $request->boolean('skipHeader', true);
            $validateOnly = $request->boolean('validateOnly', false);

            Log::info('Starting residents import', [
                'filename' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'skipHeader' => $skipHeader,
                'validateOnly' => $validateOnly
            ]);

            // Process the import
            $result = $this->processResidentsImport($file, $skipHeader, $validateOnly);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => $validateOnly 
                    ? 'Validation completed successfully' 
                    : "Successfully imported {$result['successful']} residents"
            ]);

        } catch (\Exception $e) {
            Log::error('Residents import failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process the residents import
     */
    private function processResidentsImport($file, bool $skipHeader = true, bool $validateOnly = false): array
    {
        try {
            // Load the Excel file
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();
            
            Log::info('Excel file loaded', [
                'total_rows' => count($rows),
                'has_data' => !empty($rows)
            ]);
            
            if (empty($rows)) {
                throw new \Exception('Excel file is empty');
            }
            
            $headers = [];
            if ($skipHeader && count($rows) > 0) {
                $headers = array_shift($rows); // Remove and store header row
                Log::info('Headers extracted', ['headers' => $headers]);
            }
            
            $results = [
                'total' => count($rows),
                'successful' => 0,
                'failed' => 0,
                'errors' => [],
                'imported_ids' => []
            ];
            
            DB::beginTransaction();
            
            foreach ($rows as $index => $row) {
                $rowNumber = $skipHeader ? $index + 2 : $index + 1;
                
                try {
                    // Map row data to associative array using headers
                    $data = $this->mapRowToData($row, $headers);
                    
                    // Transform Excel data to match database format
                    $data = $this->transformResidentData($data);
                    
                    // Log first row for debugging
                    if ($index === 0) {
                        Log::info('First row transformed data', ['data' => $data]);
                    }
                    
                    // Validate the data
                    $validator = $this->validateResidentData($data);
                    
                    if ($validator->fails()) {
                        $results['failed']++;
                        $results['errors'][] = [
                            'row' => $rowNumber,
                            'errors' => $validator->errors()->toArray()
                        ];
                        continue;
                    }
                    
                    if (!$validateOnly) {
                        // Save to database
                        $resident = Resident::create($data);
                        $results['imported_ids'][] = $resident->id;
                    }
                    
                    $results['successful']++;
                    
                } catch (\Exception $e) {
                    Log::error('Error processing row ' . $rowNumber, [
                        'error' => $e->getMessage(),
                        'row_data' => $row
                    ]);
                    
                    $results['failed']++;
                    $results['errors'][] = [
                        'row' => $rowNumber,
                        'errors' => ['general' => [$e->getMessage()]]
                    ];
                }
            }
            
            if ($validateOnly) {
                DB::rollBack();
            } else {
                DB::commit();
            }
            
            return $results;
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Import failed completely', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Transform resident data from Excel format to database format
     */
    private function transformResidentData(array $data): array
    {
        $transformed = [];
        
        // Map Excel headers to database fields
        $fieldMapping = [
            // Basic Information
            'First Name' => 'first_name',
            'Last Name' => 'last_name',
            'Middle Name' => 'middle_name',
            'Suffix' => 'suffix',
            'Birth Date' => 'birth_date',
            'Birth Place' => 'birth_place',
            'Age' => 'age',
            'Gender' => 'gender',
            'Civil Status' => 'civil_status',
            'Nationality' => 'nationality',
            'Religion' => 'religion',
            'Employment Status' => 'employment_status',
            'Educational Attainment' => 'educational_attainment',
            
            // Contact Information
            'Mobile Number' => 'mobile_number',
            'Landline Number' => 'landline_number',
            'Email Address' => 'email_address',
            
            // Address Information
            'Region' => 'region',
            'Province' => 'province',
            'City' => 'city',
            'Barangay' => 'barangay',
            'Purok' => 'purok',
            'Street' => 'street',
            'Complete Address' => 'complete_address',
            
            // Special Classifications
            'Senior Citizen' => 'senior_citizen',
            'Person with Disability' => 'person_with_disability',
            '4Ps Beneficiary' => 'four_ps_beneficiary',
            'Voter Status' => 'voter_status',
            
            // Household fields
            'Is Household Head' => 'is_household_head',
        ];
        
        // Transform fields using the mapping
        foreach ($fieldMapping as $excelField => $dbField) {
            if (isset($data[$excelField])) {
                $transformed[$dbField] = $data[$excelField];
            }
        }
        
        // Handle boolean fields
        $booleanFields = [
            'senior_citizen', 
            'person_with_disability', 
            'four_ps_beneficiary', 
            'is_household_head'
        ];
        
        foreach ($booleanFields as $field) {
            if (isset($transformed[$field])) {
                $transformed[$field] = $this->parseBoolean($transformed[$field]);
            } else {
                $transformed[$field] = false;
            }
        }
        
        // Handle enum fields - convert to uppercase
        $enumFields = [
            'gender', 'civil_status', 'nationality', 'religion',
            'employment_status', 'educational_attainment', 'voter_status'
        ];
        
        foreach ($enumFields as $field) {
            if (isset($transformed[$field]) && $transformed[$field]) {
                $transformed[$field] = strtoupper(trim($transformed[$field]));
                
                // Special handling for employment status
                if ($field === 'employment_status') {
                    $employmentMapping = [
                        'SELF EMPLOYED' => 'SELF_EMPLOYED',
                    ];
                    if (isset($employmentMapping[$transformed[$field]])) {
                        $transformed[$field] = $employmentMapping[$transformed[$field]];
                    }
                }
            }
        }
        
        // Handle date fields
        if (isset($transformed['birth_date']) && $transformed['birth_date']) {
            $transformed['birth_date'] = $this->parseExcelDate($transformed['birth_date']);
        }
        
        // Calculate age if not provided
        if (empty($transformed['age']) && !empty($transformed['birth_date'])) {
            try {
                $birthDate = Carbon::parse($transformed['birth_date']);
                $transformed['age'] = $birthDate->age;
            } catch (\Exception $e) {
                Log::warning('Could not calculate age from birth_date', ['birth_date' => $transformed['birth_date']]);
            }
        }
        
        // Convert empty strings to null
        foreach ($transformed as $key => $value) {
            if ($value === '' || $value === null) {
                $transformed[$key] = null;
            }
        }
        
        // Set default values
        $transformed['status'] = 'ACTIVE';
        
        return $transformed;
    }

    /**
     * Validate resident data
     */
    private function validateResidentData(array $data): \Illuminate\Contracts\Validation\Validator
    {
        $rules = [
            // Required fields
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birth_date' => 'required|date|before:today',
            'birth_place' => 'required|string|max:255',
            'complete_address' => 'required|string',
            'gender' => 'required|in:MALE,FEMALE',
            'civil_status' => 'required|in:SINGLE,MARRIED,WIDOWED,DIVORCED,SEPARATED',
            'employment_status' => 'required|in:EMPLOYED,UNEMPLOYED,SELF_EMPLOYED,RETIRED,STUDENT,OFW',
            
            // Optional fields
            'middle_name' => 'nullable|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'age' => 'nullable|integer|min:0|max:150',
            'mobile_number' => 'nullable|regex:/^09\d{9}$/',
            'email_address' => 'nullable|email',
            
            // Booleans
            'senior_citizen' => 'boolean',
            'person_with_disability' => 'boolean',
            'four_ps_beneficiary' => 'boolean',
            'is_household_head' => 'boolean',
        ];
        
        $messages = [
            'birth_date.before' => 'Birth date must be in the past',
            'mobile_number.regex' => 'Mobile number must be in format 09XXXXXXXXX',
        ];
        
        return Validator::make($data, $rules, $messages);
    }

    /**
     * Parse boolean value from Excel
     */
    private function parseBoolean($value): bool
    {
        if (is_bool($value)) {
            return $value;
        }
        
        if (is_numeric($value)) {
            return (bool) $value;
        }
        
        if (is_string($value)) {
            $value = strtoupper(trim($value));
            return in_array($value, ['TRUE', '1', 'YES', 'Y', 'CHECKED', 'ON']);
        }
        
        return false;
    }

    /**
     * Parse Excel date
     */
    private function parseExcelDate($value): ?string
    {
        if (empty($value)) {
            return null;
        }
        
        // If it's numeric, it's an Excel date serial number
        if (is_numeric($value)) {
            try {
                $date = Date::excelToDateTimeObject($value);
                return $date->format('Y-m-d');
            } catch (\Exception $e) {
                Log::warning('Failed to parse Excel date serial', ['value' => $value]);
            }
        }
        
        // Try to parse as string date
        try {
            $date = Carbon::parse($value);
            return $date->format('Y-m-d');
        } catch (\Exception $e) {
            Log::warning('Failed to parse date string', ['value' => $value]);
            return null;
        }
    }

    /**
     * Map row data to associative array using headers
     */
    private function mapRowToData(array $row, array $headers): array
    {
        $data = [];
        foreach ($headers as $index => $header) {
            $data[trim($header)] = isset($row[$index]) ? $row[$index] : null;
        }
        return $data;
    }

    /**
     * Import households from Excel file
     */
    public function importHouseholds(Request $request): JsonResponse
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:xlsx,xls|max:10240',
                'skipHeader' => 'sometimes|boolean',
                'validateOnly' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('file');
            $skipHeader = $request->boolean('skipHeader', true);
            $validateOnly = $request->boolean('validateOnly', false);

            Log::info('Starting households import', [
                'filename' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'skipHeader' => $skipHeader,
                'validateOnly' => $validateOnly
            ]);

            // Process the import
            $result = $this->processHouseholdsImport($file, $skipHeader, $validateOnly);

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => $validateOnly 
                    ? 'Validation completed successfully' 
                    : "Successfully imported {$result['successful']} households"
            ]);

        } catch (\Exception $e) {
            Log::error('Households import failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process the households import
     */
    private function processHouseholdsImport($file, bool $skipHeader = true, bool $validateOnly = false): array
    {
        try {
            // Load the Excel file
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();
            
            Log::info('Excel file loaded for households', [
                'total_rows' => count($rows),
                'has_data' => !empty($rows)
            ]);
            
            if (empty($rows)) {
                throw new \Exception('Excel file is empty');
            }
            
            $headers = [];
            if ($skipHeader && count($rows) > 0) {
                $headers = array_shift($rows); // Remove and store header row
                Log::info('Headers extracted for households', ['headers' => $headers]);
            }
            
            $results = [
                'total' => count($rows),
                'successful' => 0,
                'failed' => 0,
                'errors' => [],
                'imported_ids' => []
            ];
            
            DB::beginTransaction();
            
            foreach ($rows as $index => $row) {
                $rowNumber = $skipHeader ? $index + 2 : $index + 1;
                
                try {
                    // Map row data to associative array using headers
                    $data = $this->mapRowToData($row, $headers);
                    
                    // Transform Excel data to match database format
                    $data = $this->transformHouseholdData($data);
                    
                    // Log first row for debugging
                    if ($index === 0) {
                        Log::info('First household row transformed data', ['data' => $data]);
                    }
                    
                    // Validate the data
                    $validator = $this->validateHouseholdData($data);
                    
                    if ($validator->fails()) {
                        $results['failed']++;
                        $results['errors'][] = [
                            'row' => $rowNumber,
                            'errors' => $validator->errors()->toArray()
                        ];
                        continue;
                    }
                    
                    if (!$validateOnly) {
                        // Generate household number if not provided (following frontend-first principle)
                        if (empty($data['household_number'])) {
                            $data['household_number'] = $this->generateHouseholdNumberForImport();
                        }
                        
                        // Save to database
                        $household = \App\Models\Household::create($data);
                        $results['imported_ids'][] = $household->id;
                    }
                    
                    $results['successful']++;
                    
                } catch (\Exception $e) {
                    Log::error('Error processing household row ' . $rowNumber, [
                        'error' => $e->getMessage(),
                        'row_data' => $row
                    ]);
                    
                    $results['failed']++;
                    $results['errors'][] = [
                        'row' => $rowNumber,
                        'errors' => ['general' => [$e->getMessage()]]
                    ];
                }
            }
            
            if ($validateOnly) {
                DB::rollBack();
            } else {
                DB::commit();
            }
            
            return $results;
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Household import failed completely', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Transform household data from Excel format to database format
     */
    private function transformHouseholdData(array $data): array
    {
        $transformed = [];
        
        // Map Excel headers to database fields
        $fieldMapping = [
            // Basic Information
            'Household Number' => 'household_number',
            'Household Type' => 'household_type',
            'Head Resident ID' => 'head_resident_id',
            
            // Address Information
            'Complete Address' => 'complete_address',
            
            // Income Information
            'Monthly Income' => 'monthly_income',
            'Primary Income Source' => 'primary_income_source',
            
            // Classifications
            '4Ps Beneficiary' => 'four_ps_beneficiary',
            'Indigent Family' => 'indigent_family',
            'Has Senior Citizen' => 'has_senior_citizen',
            'Has PWD Member' => 'has_pwd_member',
            
            // House Details
            'House Type' => 'house_type',
            'Ownership Status' => 'ownership_status',
            
            // Utilities
            'Has Electricity' => 'has_electricity',
            'Has Water Supply' => 'has_water_supply',
            'Has Internet Access' => 'has_internet_access',
            
            // Additional Information
            'Remarks' => 'remarks',
        ];
        
        // Transform fields using the mapping
        foreach ($fieldMapping as $excelField => $dbField) {
            if (isset($data[$excelField])) {
                $transformed[$dbField] = $data[$excelField];
            }
        }
        
        // Handle boolean fields
        $booleanFields = [
            'four_ps_beneficiary', 'indigent_family', 'has_senior_citizen', 
            'has_pwd_member', 'has_electricity', 'has_water_supply', 'has_internet_access'
        ];
        
        foreach ($booleanFields as $field) {
            if (isset($transformed[$field])) {
                $transformed[$field] = $this->parseBoolean($transformed[$field]);
            } else {
                $transformed[$field] = false;
            }
        }
        
        // Handle enum fields - convert to uppercase
        $enumFields = ['household_type', 'monthly_income', 'house_type', 'ownership_status'];
        
        foreach ($enumFields as $field) {
            if (isset($transformed[$field]) && $transformed[$field]) {
                $value = strtoupper(trim($transformed[$field]));
                
                // Handle common variations
                if ($field === 'household_type') {
                    $typeMapping = [
                        'NUCLEAR FAMILY' => 'NUCLEAR',
                        'EXTENDED FAMILY' => 'EXTENDED',
                        'SINGLE PERSON' => 'SINGLE',
                        'SINGLE-PARENT' => 'SINGLE_PARENT',
                        'SINGLE PARENT' => 'SINGLE_PARENT',
                        'OTHERS' => 'OTHER'
                    ];
                    $value = $typeMapping[$value] ?? $value;
                }
                
                if ($field === 'monthly_income') {
                    $value = str_replace(['₱', ',', ' '], '', $value);
                    if (strpos($value, '<10000') !== false || strpos($value, 'BELOW10000') !== false) {
                        $value = 'BELOW_10000';
                    } elseif (strpos($value, '10000-25000') !== false) {
                        $value = 'RANGE_10000_25000';
                    } elseif (strpos($value, '25000-50000') !== false) {
                        $value = 'RANGE_25000_50000';
                    } elseif (strpos($value, '50000-100000') !== false) {
                        $value = 'RANGE_50000_100000';
                    } elseif (strpos($value, '>100000') !== false || strpos($value, 'ABOVE100000') !== false) {
                        $value = 'ABOVE_100000';
                    }
                }
                
                if ($field === 'house_type' && strpos($value, 'SEMI') !== false && strpos($value, 'CONCRETE') !== false) {
                    $value = 'SEMI_CONCRETE';
                }
                
                if ($field === 'ownership_status' && (strpos($value, 'INFORMAL') !== false || strpos($value, 'SETTLER') !== false)) {
                    $value = 'INFORMAL_SETTLER';
                }
                
                $transformed[$field] = $value;
            }
        }
        
        // Convert empty strings to null
        foreach ($transformed as $key => $value) {
            if ($value === '' || $value === null) {
                $transformed[$key] = null;
            }
        }
        
        // Set default values
        $transformed['status'] = 'ACTIVE';
        
        return $transformed;
    }

    /**
     * Validate household data
     */
    private function validateHouseholdData(array $data): \Illuminate\Validation\Validator
    {
        // Use the household schema validation rules but make them more lenient for import
        $rules = [
            'household_number' => 'sometimes|string|max:50',  // Sometimes because we can generate it
            'household_type' => 'required|in:NUCLEAR,EXTENDED,SINGLE,SINGLE_PARENT,OTHER',
            'complete_address' => 'required|string',
            'monthly_income' => 'nullable|in:BELOW_10000,RANGE_10000_25000,RANGE_25000_50000,RANGE_50000_100000,ABOVE_100000',
            'primary_income_source' => 'nullable|string|max:255',
            'four_ps_beneficiary' => 'boolean',
            'indigent_family' => 'boolean',
            'has_senior_citizen' => 'boolean',
            'has_pwd_member' => 'boolean',
            'house_type' => 'nullable|in:CONCRETE,SEMI_CONCRETE,WOOD,BAMBOO,MIXED',
            'ownership_status' => 'nullable|in:OWNED,RENTED,SHARED,INFORMAL_SETTLER',
            'has_electricity' => 'boolean',
            'has_water_supply' => 'boolean',
            'has_internet_access' => 'boolean',
            'remarks' => 'nullable|string',
            'head_resident_id' => 'nullable|string|exists:residents,id',
        ];
        
        return Validator::make($data, $rules);
    }

    /**
     * Generate household number for import (frontend-first principle)
     */
    private function generateHouseholdNumberForImport(): string
    {
        $prefix = 'HH';
        $year = date('Y');
        
        // Generate 8-character random alphanumeric string (following frontend pattern)
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $randomString = '';
        
        for ($i = 0; $i < 8; $i++) {
            $randomString .= $chars[rand(0, strlen($chars) - 1)];
        }
        
        return "{$prefix}-{$year}-{$randomString}";
    }

    /**
     * Get import history
     */
    public function getImportHistory(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [],
            'meta' => [
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 15,
                'total' => 0,
            ]
        ]);
    }
}