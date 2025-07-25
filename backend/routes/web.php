<?php

use Illuminate\Support\Facades\Route;

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