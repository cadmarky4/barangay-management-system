<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Database status check
Route::get('/db-status', function () {
    try {
        $connection = \Illuminate\Support\Facades\DB::connection();
        $dbName = $connection->getDatabaseName();
        $driver = $connection->getDriverName();
        
        // Test a simple query
        $userCount = \App\Models\User::count();
        $residentCount = \App\Models\Resident::count();
        
        return response()->json([
            'status' => 'connected',
            'driver' => $driver,
            'database' => $dbName,
            'user_count' => $userCount,
            'resident_count' => $residentCount,
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
        $userCount = \App\Models\User::count();
        if ($userCount === 0) {
            \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Migrations and seeding completed',
            'user_count' => \App\Models\User::count(),
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'failed',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Create test user
Route::get('/create-test-user', function () {
    try {
        $user = \App\Models\User::create([
            'name' => 'Test Admin',
            'username' => 'testadmin', 
            'email' => 'test@admin.com',
            'password' => bcrypt('password123'),
        ]);
        
        return response()->json([
            'message' => 'Test user created successfully',
            'username' => 'testadmin',
            'password' => 'password123'
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()]);
    }
});