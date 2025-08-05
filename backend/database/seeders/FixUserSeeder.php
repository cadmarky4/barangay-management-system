<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FixUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        try {
            echo "🔧 Fixing user schema...\n";
            
            // Check if is_active column exists, if not add it
            if (!Schema::hasColumn('users', 'is_active')) {
                echo "Adding is_active column...\n";
                DB::statement('ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true');
            }
            
            // Check if is_verified column exists, if not add it
            if (!Schema::hasColumn('users', 'is_verified')) {
                echo "Adding is_verified column...\n";
                DB::statement('ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false');
            }
            
            // Update all existing users to be active
            DB::table('users')->update([
                'is_active' => true,
                'updated_at' => now()
            ]);
            
            // Delete existing superadmin
            DB::table('users')->where('username', 'superadmin')->delete();
            
            // Create new superadmin with proper fields
            DB::table('users')->insert([
                'username' => 'superadmin',
                'email' => 'superadmin@barangay.gov.ph',
                'password' => bcrypt('SuperAdmin123!'),
                'first_name' => 'Super',
                'last_name' => 'Administrator',
                'role' => 'SUPER_ADMIN',
                'department' => 'Administration',
                'position' => 'System Administrator',
                'is_active' => true,
                'is_verified' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // Create admin user too
            DB::table('users')->where('username', 'admin')->delete();
            DB::table('users')->insert([
                'username' => 'admin',
                'email' => 'admin@barangay.gov.ph',
                'password' => bcrypt('Admin123!'),
                'first_name' => 'Barangay',
                'last_name' => 'Admin',
                'role' => 'ADMIN',
                'department' => 'Administration',
                'position' => 'Administrator',
                'is_active' => true,
                'is_verified' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            echo "✅ User schema fixed successfully!\n";
            echo "📋 Login credentials:\n";
            echo "   Username: superadmin | Password: SuperAdmin123!\n";
            echo "   Username: admin      | Password: Admin123!\n";
            
        } catch (\Exception $e) {
            echo "❌ Error: " . $e->getMessage() . "\n";
            throw $e;
        }
    }
}