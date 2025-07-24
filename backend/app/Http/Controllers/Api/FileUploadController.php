<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class FileUploadController extends Controller
{
    /**
     * Handle file upload for resident profile photos.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function upload(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'file' => 'required|file|image|max:2048', // max 2MB
            ]);

            $file = $request->file('file');
            
            // Store the file and let Laravel generate the filename
            $path = $file->store('public/residents/photos');
            
            // Extract just the filename from the path
            $filename = basename($path);

            // Double-check file existence
            if (!Storage::exists($path)) {
                Log::error('File not found after upload: ' . $path);
                return response()->json([
                    'error' => 'File was not saved to storage.',
                    'filename' => $filename,
                ], 500);
            }

            // Return only the filename - frontend will build the full URL
            return response()->json([
                'filename' => $filename,
                'path' => $path,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('File upload error: ' . $e->getMessage());
            return response()->json([
                'error' => 'File upload failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
