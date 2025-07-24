<?php

use Illuminate\Support\Facades\Route;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

Route::get('/', function () {
    return view('welcome');
});

// Temporary debug route - REMOVE AFTER TESTING
Route::get('/debug-db', function () {
    try {
        $userCount = User::count();
        $tables = Schema::getTableListing();
        $firstUser = User::first();
        
        return response()->json([
            'user_count' => $userCount,
            'tables' => $tables,
            'first_user' => $firstUser ? [
                'id' => $firstUser->id,
                'name' => $firstUser->name,
                'username' => $firstUser->username,
                'email' => $firstUser->email,
            ] : null,
            'database_file_exists' => file_exists('/var/www/html/database/database.sqlite'),
            'database_path' => env('DB_DATABASE'),
            'app_env' => env('APP_ENV')
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'database_file_exists' => file_exists('/var/www/html/database/database.sqlite'),
            'database_path' => env('DB_DATABASE')
        ]);
    }
});