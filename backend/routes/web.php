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

// Create tables in correct order without foreign keys
Route::get('/create-tables-step-by-step', function () {
    try {
        // Step 1: Drop all tables
        \Illuminate\Support\Facades\DB::statement('DROP SCHEMA public CASCADE');
        \Illuminate\Support\Facades\DB::statement('CREATE SCHEMA public');
        
        // Step 2: Create migrations table
        \Illuminate\Support\Facades\DB::statement("
            CREATE TABLE migrations (
                id SERIAL PRIMARY KEY,
                migration VARCHAR(255) NOT NULL,
                batch INTEGER NOT NULL
            )
        ");
        
        // Step 3: Run migrations without foreign key checks
        $migrationFiles = glob(database_path('migrations/*.php'));
        sort($migrationFiles); // Ensure proper order
        
        $batch = 1;
        $createdTables = [];
        
        foreach ($migrationFiles as $file) {
            $migrationName = basename($file, '.php');
            
            try {
                // Skip if already processed
                $exists = \Illuminate\Support\Facades\DB::table('migrations')
                    ->where('migration', $migrationName)
                    ->exists();
                    
                if (!$exists) {
                    // Include and run migration
                    include_once $file;
                    
                    // Get the class name from the file
                    $className = \Illuminate\Support\Str::studly(implode('_', array_slice(explode('_', $migrationName), 4)));
                    
                    if (class_exists($className)) {
                        $migration = new $className;
                        $migration->up();
                        
                        // Record in migrations table
                        \Illuminate\Support\Facades\DB::table('migrations')->insert([
                            'migration' => $migrationName,
                            'batch' => $batch
                        ]);
                        
                        $createdTables[] = $migrationName;
                    }
                }
            } catch (\Exception $e) {
                // Skip foreign key errors for now
                if (!str_contains($e->getMessage(), 'does not exist')) {
                    throw $e;
                }
                $createdTables[] = $migrationName . ' (skipped foreign keys)';
            }
        }
        
        // Step 4: Now add foreign keys in a second pass
        foreach ($migrationFiles as $file) {
            $migrationName = basename($file, '.php');
            
            try {
                include_once $file;
                $className = \Illuminate\Support\Str::studly(implode('_', array_slice(explode('_', $migrationName), 4)));
                
                if (class_exists($className)) {
                    $migration = new $className;
                    // Try to run up() again to add foreign keys
                    $migration->up();
                }
            } catch (\Exception $e) {
                // Ignore errors on second pass
            }
        }
        
        // Step 5: Seed the database
        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        
        $userCount = \Illuminate\Support\Facades\DB::table('users')->count();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Tables created step by step',
            'created_tables' => $createdTables,
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

// Simple approach - create core tables manually
Route::get('/create-core-tables', function () {
    try {
        // Drop and recreate everything
        \Illuminate\Support\Facades\DB::statement('DROP SCHEMA public CASCADE');
        \Illuminate\Support\Facades\DB::statement('CREATE SCHEMA public');
        
        // Create users table manually
        \Illuminate\Support\Facades\DB::statement('
            CREATE TABLE users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255),
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(255) DEFAULT \'user\',
                status VARCHAR(255) DEFAULT \'active\',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL
            )
        ');
        
        // Create residents table manually
        \Illuminate\Support\Facades\DB::statement('
            CREATE TABLE residents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                middle_name VARCHAR(255),
                suffix VARCHAR(255),
                complete_address TEXT,
                mobile_number VARCHAR(255),
                email_address VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL
            )
        ');
        
        // Create documents table manually
        \Illuminate\Support\Facades\DB::statement('
            CREATE TABLE documents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                resident_id UUID,
                document_type VARCHAR(255) NOT NULL,
                purpose TEXT,
                status VARCHAR(255) DEFAULT \'pending\',
                valid_id_presented VARCHAR(255),
                processing_fee DECIMAL(10,2) DEFAULT 50.00,
                payment_status VARCHAR(255) DEFAULT \'paid\',
                priority VARCHAR(255) DEFAULT \'medium\',
                request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ');
        
        // Seed a test user
        \Illuminate\Support\Facades\DB::table('users')->insert([
            'name' => 'Super Admin',
            'username' => 'superadmin',
            'email' => 'superadmin@barangay.gov.ph',
            'password' => bcrypt('SuperAdmin123!'),
            'role' => 'super_admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        $userCount = \Illuminate\Support\Facades\DB::table('users')->count();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Core tables created successfully',
            'user_count' => $userCount,
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'failed',
            'error' => $e->getMessage(),
        ], 500);
    }
});

// Check superadmin user details
Route::get('/check-superadmin', function () {
    try {
        $user = \Illuminate\Support\Facades\DB::table('users')
            ->where('username', 'superadmin')
            ->first();
        
        if ($user) {
            return response()->json([
                'status' => 'found',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'status' => $user->status ?? 'null',
                    'role' => $user->role ?? 'null',
                    'created_at' => $user->created_at,
                ]
            ]);
        } else {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Superadmin user not found'
            ]);
        }
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'failed',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Force fix superadmin account
Route::get('/fix-superadmin', function () {
    try {
        // Delete existing superadmin if exists
        \Illuminate\Support\Facades\DB::table('users')
            ->where('username', 'superadmin')
            ->delete();
        
        // Create new active superadmin
        $userId = \Illuminate\Support\Facades\DB::table('users')->insertGetId([
            'name' => 'Super Administrator',
            'username' => 'superadmin',
            'email' => 'superadmin@barangay.gov.ph',
            'password' => bcrypt('SuperAdmin123!'),
            'role' => 'super_admin',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // Verify the user was created properly
        $user = \Illuminate\Support\Facades\DB::table('users')
            ->where('username', 'superadmin')
            ->first();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Superadmin account recreated successfully',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'status' => $user->status,
                'role' => $user->role
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'failed',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Activate superadmin account
Route::get('/activate-superadmin', function () {
    try {
        $updated = \Illuminate\Support\Facades\DB::table('users')
            ->where('username', 'superadmin')
            ->update([
                'status' => 'active',
                'updated_at' => now()
            ]);
        
        if ($updated) {
            return response()->json([
                'status' => 'success',
                'message' => 'Superadmin account activated successfully'
            ]);
        } else {
            return response()->json([
                'status' => 'failed',
                'message' => 'Superadmin account not found'
            ]);
        }
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'failed',
            'error' => $e->getMessage()
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
