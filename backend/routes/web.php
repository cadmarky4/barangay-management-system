<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Check what tables exist in PostgreSQL
Route::get('/check-tables', function () {
    try {
        $tables = \Illuminate\Support\Facades\DB::select("
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        ");
        
        return response()->json([
            'status' => 'success',
            'connection' => config('database.default'),
            'database_url_set' => env('DATABASE_URL') ? 'Yes' : 'No',
            'tables' => collect($tables)->pluck('table_name')->toArray(),
            'table_count' => count($tables)
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'failed',
            'error' => $e->getMessage(),
            'connection' => config('database.default'),
            'database_url_set' => env('DATABASE_URL') ? 'Yes' : 'No',
        ], 500);
    }
});

// Force create migrations table and run migrations
Route::get('/force-setup', function () {
    try {
        // Create migrations table if it doesn't exist
        \Illuminate\Support\Facades\DB::statement("
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                migration VARCHAR(255) NOT NULL,
                batch INTEGER NOT NULL
            )
        ");
        
        // Run fresh migrations
        \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--force' => true]);
        
        // Run seeds
        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        
        // Check results
        $userCount = \Illuminate\Support\Facades\DB::table('users')->count();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Database setup completed',
            'user_count' => $userCount,
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'failed',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Database status check
Route::get('/db-status', function () {
    try {
        // Don't use User model, use raw query instead
        $userCount = \Illuminate\Support\Facades\DB::table('users')->count();
        
        return response()->json([
            'status' => 'connected',
            'driver' => \Illuminate\Support\Facades\DB::connection()->getDriverName(),
            'database' => \Illuminate\Support\Facades\DB::connection()->getDatabaseName(),
            'user_count' => $userCount,
            'connection_name' => config('database.default'),
            'database_url_set' => env('DATABASE_URL') ? 'Yes' : 'No',
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'failed',
            'error' => $e->getMessage(),
            'connection_name' => config('database.default'),
            'database_url_set' => env('DATABASE_URL') ? 'Yes' : 'No',
        ], 500);
    }
});

// Force run migrations
Route::get('/run-migrations', function () {
    try {
        // Run migrations
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        
        // Seed database if empty
        $userCount = \Illuminate\Support\Facades\DB::table('users')->count();
        if ($userCount === 0) {
            \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Migrations and seeding completed',
            'user_count' => \Illuminate\Support\Facades\DB::table('users')->count(),
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'failed',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Create test user without using User model
Route::get('/create-test-user', function () {
    try {
        $userId = \Illuminate\Support\Facades\DB::table('users')->insertGetId([
            'name' => 'Test Admin',
            'username' => 'testadmin', 
            'email' => 'test@admin.com',
            'password' => bcrypt('password123'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        return response()->json([
            'message' => 'Test user created successfully',
            'user_id' => $userId,
            'username' => 'testadmin',
            'password' => 'password123'
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()]);
    }
});