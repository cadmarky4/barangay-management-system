<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class SettingController extends Controller
{
    /**
     * Get current settings
     */
    public function index(): JsonResponse
    {
        try {
            $settings = Setting::current();
            
            return response()->json([
                'success' => true,
                'data' => $settings->toFrontendFormat(),
                'message' => 'Settings retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve settings', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update settings
     */
    public function update(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                // General Information
                'barangay' => 'sometimes|string|max:100',
                'city' => 'sometimes|string|max:100',
                'province' => 'sometimes|string|max:100',
                'region' => 'sometimes|string|max:100',
                'type' => 'sometimes|in:Urban,Rural,Highly Urbanized',
                'contactNumber' => 'sometimes|string|max:20',
                'emailAddress' => 'sometimes|email|max:100',
                'openingHours' => 'sometimes|string|max:20',
                'closingHours' => 'sometimes|string|max:20',
                'primaryLanguage' => 'sometimes|string|max:50',
                'secondaryLanguage' => 'sometimes|string|max:50',
                
                // Privacy and Security (frontend sends as strings)
                'sessionTimeout' => 'sometimes|string|numeric|min:5|max:480',
                'maxLoginAttempts' => 'sometimes|string|numeric|min:1|max:10',
                'dataRetention' => 'sometimes|string|numeric|min:1|max:50',
                'backupFrequency' => 'sometimes|in:Daily,Weekly,Monthly',
                
                // System
                'systemName' => 'sometimes|string|max:100',
                'versionNumber' => 'sometimes|string|max:20',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();
            try {
                $settings = Setting::current();
                $settings->updateFromFrontend($request->all());
                
                // Reload the model to get fresh data
                $settings->refresh();
                
                DB::commit();
                
                return response()->json([
                    'success' => true,
                    'data' => $settings->toFrontendFormat(),
                    'message' => 'Settings updated successfully'
                ]);
            } catch (\Exception $updateException) {
                DB::rollBack();
                throw $updateException;
            }
        } catch (\Exception $e) {
            Log::error('Failed to update settings', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset settings to default values
     */
    public function reset(): JsonResponse
    {
        try {
            DB::beginTransaction();
            
            $settings = Setting::current();
            
            // Reset to default values
            $defaultData = [
                'barangay' => '',
                'city' => '',
                'province' => '',
                'region' => '',
                'type' => 'Urban',
                'contactNumber' => '',
                'emailAddress' => '',
                'openingHours' => '8:00 AM',
                'closingHours' => '5:00 PM',
                'primaryLanguage' => 'Filipino',
                'secondaryLanguage' => 'English',
                'sessionTimeout' => '30',
                'maxLoginAttempts' => '3',
                'dataRetention' => '7',
                'backupFrequency' => 'Daily',
                'systemName' => 'Barangay Management System',
                'versionNumber' => '1.0.0'
            ];
            
            $settings->updateFromFrontend($defaultData);
            
            // Reload the model to get fresh data
            $settings->refresh();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'data' => $settings->toFrontendFormat(),
                'message' => 'Settings reset to default values successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to reset settings', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create backup of current settings (simplified)
     */
    public function backup(Request $request): JsonResponse
    {
        try {
            $settings = Setting::current();
            
            $backup = [
                'settings' => $settings->toFrontendFormat(),
                'timestamp' => now()->toISOString(),
                'version' => $settings->version_number ?? '1.0.0',
                'createdBy' => Auth::check() ? Auth::user()->name : 'System'
            ];
            
            return response()->json([
                'success' => true,
                'data' => $backup,
                'message' => 'Settings backup created successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create settings backup', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create settings backup',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test settings configuration (simplified)
     */
    public function test(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'section' => 'sometimes|in:general,privacy,system,all',
                'validateOnly' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $section = $request->input('section', 'all');
            $validateOnly = $request->input('validateOnly', true);
            
            // Simple validation test - in real implementation you might test email connectivity, etc.
            return response()->json([
                'success' => true,
                'data' => [
                    'success' => true,
                    'message' => 'Settings test completed successfully',
                    'details' => [
                        'section' => $section,
                        'validateOnly' => $validateOnly
                    ]
                ],
                'message' => 'Settings test completed successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to test settings', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to test settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
