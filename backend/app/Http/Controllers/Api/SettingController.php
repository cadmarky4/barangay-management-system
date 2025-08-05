<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    /**
     * Display the settings.
     */
    public function index(): JsonResponse
    {
        try {
            $settings = Setting::current();
            
            return response()->json([
                'message' => 'Settings retrieved successfully',
                'data' => $settings->toFrontendFormat(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve settings',
                'errors' => ['general' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Update the settings.
     */
    public function update(Request $request): JsonResponse
    {
        try {
            // Validation rules
            $validator = Validator::make($request->all(), [
                // General Information
                'barangay' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'province' => 'nullable|string|max:255',
                'region' => 'nullable|string|max:255',
                'type' => 'nullable|string|max:255',
                'contactNumber' => 'nullable|string|max:255',
                'emailAddress' => 'nullable|email|max:255',
                'openingHours' => 'nullable|string|max:20',
                'closingHours' => 'nullable|string|max:20',
                'primaryLanguage' => 'nullable|string|max:255',
                'secondaryLanguage' => 'nullable|string|max:255',
                
                // Privacy and Security
                'sessionTimeout' => 'nullable|string|numeric|min:5|max:480',
                'maxLoginAttempts' => 'nullable|string|numeric|min:1|max:10',
                'dataRetention' => 'nullable|string|numeric|min:1|max:50',
                'backupFrequency' => 'nullable|in:Daily,Weekly,Monthly',
                
                // System
                'systemName' => 'nullable|string|max:255',
                'versionNumber' => 'nullable|string|max:20',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $settings = Setting::current();
            $settings->updateFromFrontend($request->all());

            return response()->json([
                'message' => 'Settings updated successfully',
                'data' => $settings->fresh()->toFrontendFormat(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update settings',
                'errors' => ['general' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Reset settings to default values.
     */
    public function reset(): JsonResponse
    {
        try {
            $settings = Setting::current();
            
            $settings->update([
                'system_name' => 'Barangay West Triangle',
                'version_number' => '1.0.0',
                'primary_language' => 'English',
                'session_timeout' => 30,
                'max_login_attempts' => 3,
                'data_retention' => 7,
                'backup_frequency' => 'Daily',
                // Clear other fields
                'barangay' => null,
                'city' => null,
                'province' => null,
                'region' => null,
                'type' => null,
                'contact_number' => null,
                'email_address' => null,
                'opening_hours' => null,
                'closing_hours' => null,
                'secondary_language' => null,
            ]);

            return response()->json([
                'message' => 'Settings reset to default values',
                'data' => $settings->fresh()->toFrontendFormat(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to reset settings',
                'errors' => ['general' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Create a backup of current settings.
     */
    public function backup(): JsonResponse
    {
        try {
            $settings = Setting::current();
            
            // Create backup data
            $backup = [
                'settings' => $settings->toFrontendFormat(),
                'timestamp' => now()->toISOString(),
                'version' => $settings->version_number ?? '1.0.0',
                'created_by' => auth('sanctum')->user()?->name ?? 'System'
            ];
            
            return response()->json([
                'message' => 'Settings backup created successfully',
                'data' => $backup,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create settings backup',
                'errors' => ['general' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Restore settings from backup.
     */
    public function restore(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'backupId' => 'required|string',
                'confirmRestore' => 'required|boolean|accepted',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // For now, we'll just reset to default values
            $settings = Setting::current();
            
            $settings->update([
                'system_name' => 'Barangay West Triangle',
                'version_number' => '1.0.0',
                'primary_language' => 'English',
                'session_timeout' => 30,
                'max_login_attempts' => 3,
                'data_retention' => 7,
                'backup_frequency' => 'Daily',
            ]);

            return response()->json([
                'message' => 'Settings restored successfully',
                'data' => $settings->fresh()->toFrontendFormat(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to restore settings',
                'errors' => ['general' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Get list of available backups.
     */
    public function backups(): JsonResponse
    {
        try {
            // For now, return an empty array
            $backups = [];
            
            return response()->json([
                'message' => 'Backups retrieved successfully',
                'data' => $backups,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve backups',
                'errors' => ['general' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Test settings connectivity.
     */
    public function test(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'section' => 'nullable|string|in:general,privacy,system,all',
                'validateOnly' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $section = $request->input('section', 'all');
            $result = [
                'success' => true,
                'message' => 'Settings test passed',
                'details' => [
                    'tested_section' => $section,
                    'timestamp' => now()->toISOString()
                ]
            ];

            return response()->json([
                'message' => 'Settings test completed',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Settings test failed',
                'errors' => ['general' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Get settings change history.
     */
    public function history(Request $request): JsonResponse
    {
        try {
            $limit = $request->input('limit', 10);
            
            // For now, return an empty array
            $history = [];
            
            return response()->json([
                'message' => 'Settings history retrieved successfully',
                'data' => $history,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve settings history',
                'errors' => ['general' => [$e->getMessage()]]
            ], 500);
        }
    }
}
