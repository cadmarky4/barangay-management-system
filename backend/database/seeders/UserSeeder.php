<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Resident;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Super Admin
        $superAdmin = User::create([
            'username' => 'superadmin',
            'email' => 'superadmin@barangay.gov.ph',
            'password' => Hash::make('SuperAdmin123!'),
            'first_name' => 'Super',
            'last_name' => 'Administrator',
            'phone' => '+639171234567',
            'role' => 'SUPER_ADMIN',
            'department' => 'ADMINISTRATION',
            'position' => 'System Administrator',
            'employee_id' => 'EMP-001',
            'is_active' => true,
            'is_verified' => true,
            'email_verified_at' => now(),
            'notes' => 'Initial system administrator account',
        ]);

        // Create Admin
        $admin = User::create([
            'username' => 'admin',
            'email' => 'admin@barangay.gov.ph',
            'password' => Hash::make('Admin123!'),
            'first_name' => 'Admin',
            'last_name' => 'User',
            'phone' => '+639171234568',
            'role' => 'ADMIN',
            'department' => 'ADMINISTRATION',
            'position' => 'Administrator',
            'employee_id' => 'EMP-002',
            'is_active' => true,
            'is_verified' => true,
            'email_verified_at' => now(),
            'notes' => 'Secondary administrator account',
            'created_by' => $superAdmin->id,
        ]);

        // Create Barangay Captain (must have a resident record)
        $captainResident = Resident::where('first_name', 'Maria')
            ->where('last_name', 'Santos')
            ->first();

        $captain = User::create([
            'username' => 'captain.santos',
            'email' => 'captain@barangay.gov.ph',
            'password' => Hash::make('Captain123!'),
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'middle_name' => 'Cruz',
            'phone' => '+639171234569',
            'role' => 'BARANGAY_CAPTAIN',
            'department' => 'ADMINISTRATION',
            'position' => 'Barangay Captain',
            'employee_id' => 'BC-001',
            'resident_id' => $captainResident?->id,
            'is_active' => true,
            'is_verified' => true,
            'email_verified_at' => now(),
            'notes' => 'Elected Barangay Captain',
            'created_by' => $superAdmin->id,
        ]);

        // Create Barangay Secretary
        $secretaryResident = Resident::where('first_name', 'Ana')
            ->where('last_name', 'Rodriguez')
            ->first();

        $secretary = User::create([
            'username' => 'secretary.rodriguez',
            'email' => 'secretary@barangay.gov.ph',
            'password' => Hash::make('Secretary123!'),
            'first_name' => 'Ana',
            'last_name' => 'Rodriguez',
            'middle_name' => 'Dela Cruz',
            'phone' => '+639171234570',
            'role' => 'BARANGAY_SECRETARY',
            'department' => 'ADMINISTRATION',
            'position' => 'Barangay Secretary',
            'employee_id' => 'BS-001',
            'resident_id' => $secretaryResident?->id,
            'is_active' => true,
            'is_verified' => true,
            'email_verified_at' => now(),
            'notes' => 'Elected Barangay Secretary',
            'created_by' => $superAdmin->id,
        ]);

        // Create Barangay Treasurer
        $treasurerResident = Resident::where('first_name', 'Roberto')
            ->where('last_name', 'Mendoza')
            ->first();

        $treasurer = User::create([
            'username' => 'treasurer.mendoza',
            'email' => 'treasurer@barangay.gov.ph',
            'password' => Hash::make('Treasurer123!'),
            'first_name' => 'Roberto',
            'last_name' => 'Mendoza',
            'middle_name' => 'Garcia',
            'phone' => '+639171234571',
            'role' => 'BARANGAY_TREASURER',
            'department' => 'FINANCE_TREASURY',
            'position' => 'Barangay Treasurer',
            'employee_id' => 'BT-001',
            'resident_id' => $treasurerResident?->id,
            'is_active' => true,
            'is_verified' => true,
            'email_verified_at' => now(),
            'notes' => 'Elected Barangay Treasurer',
            'created_by' => $superAdmin->id,
        ]);

        // Create Barangay Councilors
        $councilorNames = [
            ['first_name' => 'Juan', 'last_name' => 'Reyes', 'middle_name' => 'Silva'],
            ['first_name' => 'Elena', 'last_name' => 'Villanueva', 'middle_name' => 'Torres'],
            ['first_name' => 'Carlos', 'last_name' => 'Fernandez', 'middle_name' => 'Lopez'],
            ['first_name' => 'Sofia', 'last_name' => 'Morales', 'middle_name' => 'Ramos'],
            ['first_name' => 'Miguel', 'last_name' => 'Castillo', 'middle_name' => 'Perez'],
            ['first_name' => 'Carmen', 'last_name' => 'Aguilar', 'middle_name' => 'Diaz'],
            ['first_name' => 'Francisco', 'last_name' => 'Herrera', 'middle_name' => 'Santos'],
        ];

        foreach ($councilorNames as $index => $councilor) {
            $councilorResident = Resident::where('first_name', $councilor['first_name'])
                ->where('last_name', $councilor['last_name'])
                ->first();

            User::create([
                'username' => strtolower($councilor['first_name'] . '.' . $councilor['last_name']),
                'email' => strtolower($councilor['first_name'] . '.' . $councilor['last_name']) . '@barangay.gov.ph',
                'password' => Hash::make('Councilor123!'),
                'first_name' => $councilor['first_name'],
                'last_name' => $councilor['last_name'],
                'middle_name' => $councilor['middle_name'],
                'phone' => '+63917123' . str_pad(4572 + $index, 4, '0', STR_PAD_LEFT),
                'role' => 'BARANGAY_COUNCILOR',
                'department' => 'ADMINISTRATION',
                'position' => 'Barangay Councilor',
                'employee_id' => 'BC-' . str_pad($index + 2, 3, '0', STR_PAD_LEFT),
                'resident_id' => $councilorResident?->id,
                'is_active' => true,
                'is_verified' => true,
                'email_verified_at' => now(),
                'notes' => 'Elected Barangay Councilor',
                'created_by' => $superAdmin->id,
            ]);
        }

        // Create Barangay Clerk
        User::create([
            'username' => 'clerk.assistant',
            'email' => 'clerk@barangay.gov.ph',
            'password' => Hash::make('Clerk123!'),
            'first_name' => 'Lisa',
            'last_name' => 'Gonzales',
            'middle_name' => 'Martinez',
            'phone' => '+639171234580',
            'role' => 'BARANGAY_CLERK',
            'department' => 'RECORDS_MANAGEMENT',
            'position' => 'Records Clerk',
            'employee_id' => 'CL-001',
            'is_active' => true,
            'is_verified' => true,
            'email_verified_at' => now(),
            'notes' => 'Records management and clerical duties',
            'created_by' => $superAdmin->id,
        ]);

        // Create Health Worker
        User::create([
            'username' => 'health.worker',
            'email' => 'health@barangay.gov.ph',
            'password' => Hash::make('Health123!'),
            'first_name' => 'Dr. Rosa',
            'last_name' => 'Aquino',
            'middle_name' => 'Valdez',
            'phone' => '+639171234581',
            'role' => 'HEALTH_WORKER',
            'department' => 'HEALTH_SERVICES',
            'position' => 'Barangay Health Worker',
            'employee_id' => 'HW-001',
            'is_active' => true,
            'is_verified' => true,
            'email_verified_at' => now(),
            'notes' => 'Primary health care services',
            'created_by' => $superAdmin->id,
        ]);

        // Create Social Worker
        User::create([
            'username' => 'social.worker',
            'email' => 'social@barangay.gov.ph',
            'password' => Hash::make('Social123!'),
            'first_name' => 'Patricia',
            'last_name' => 'Molina',
            'middle_name' => 'Cruz',
            'phone' => '+639171234582',
            'role' => 'SOCIAL_WORKER',
            'department' => 'SOCIAL_SERVICES',
            'position' => 'Community Social Worker',
            'employee_id' => 'SW-001',
            'is_active' => true,
            'is_verified' => true,
            'email_verified_at' => now(),
            'notes' => 'Community welfare and social services',
            'created_by' => $superAdmin->id,
        ]);

        // Create Security Officer
        User::create([
            'username' => 'security.officer',
            'email' => 'security@barangay.gov.ph',
            'password' => Hash::make('Security123!'),
            'first_name' => 'Ricardo',
            'last_name' => 'Vega',
            'middle_name' => 'Torres',
            'phone' => '+639171234583',
            'role' => 'SECURITY_OFFICER',
            'department' => 'SECURITY_PUBLIC_SAFETY',
            'position' => 'Barangay Security Officer',
            'employee_id' => 'SO-001',
            'is_active' => true,
            'is_verified' => true,
            'email_verified_at' => now(),
            'notes' => 'Community security and peace and order',
            'created_by' => $superAdmin->id,
        ]);

        // Create Data Encoders
        $dataEncoders = [
            ['first_name' => 'Jennifer', 'last_name' => 'Santos', 'middle_name' => 'Reyes'],
            ['first_name' => 'Mark', 'last_name' => 'Torres', 'middle_name' => 'Garcia'],
        ];

        foreach ($dataEncoders as $index => $encoder) {
            User::create([
                'username' => strtolower($encoder['first_name'] . '.' . $encoder['last_name']),
                'email' => strtolower($encoder['first_name'] . '.' . $encoder['last_name']) . '@barangay.gov.ph',
                'password' => Hash::make('Encoder123!'),
                'first_name' => $encoder['first_name'],
                'last_name' => $encoder['last_name'],
                'middle_name' => $encoder['middle_name'],
                'phone' => '+63917123' . str_pad(4584 + $index, 4, '0', STR_PAD_LEFT),
                'role' => 'DATA_ENCODER',
                'department' => 'RECORDS_MANAGEMENT',
                'position' => 'Data Entry Specialist',
                'employee_id' => 'DE-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'is_active' => true,
                'is_verified' => true,
                'email_verified_at' => now(),
                'notes' => 'Data entry and records maintenance',
                'created_by' => $superAdmin->id,
            ]);
        }

        // Create Viewer Users
        $viewers = [
            ['first_name' => 'Grace', 'last_name' => 'Lim', 'middle_name' => 'Tan'],
            ['first_name' => 'Paolo', 'last_name' => 'Rivera', 'middle_name' => 'Cruz'],
        ];

        foreach ($viewers as $index => $viewer) {
            User::create([
                'username' => strtolower($viewer['first_name'] . '.' . $viewer['last_name']),
                'email' => strtolower($viewer['first_name'] . '.' . $viewer['last_name']) . '@barangay.gov.ph',
                'password' => Hash::make('Viewer123!'),
                'first_name' => $viewer['first_name'],
                'last_name' => $viewer['last_name'],
                'middle_name' => $viewer['middle_name'],
                'phone' => '+63917123' . str_pad(4586 + $index, 4, '0', STR_PAD_LEFT),
                'role' => 'VIEWER',
                'department' => 'ADMINISTRATION',
                'position' => 'Information Viewer',
                'employee_id' => 'VW-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'is_active' => true,
                'is_verified' => true,
                'email_verified_at' => now(),
                'notes' => 'Read-only access to system information',
                'created_by' => $superAdmin->id,
            ]);
        }

        // Create some inactive/test users
        User::create([
            'username' => 'inactive.user',
            'email' => 'inactive@barangay.gov.ph',
            'password' => Hash::make('Inactive123!'),
            'first_name' => 'Inactive',
            'last_name' => 'User',
            'phone' => '+639171234590',
            'role' => 'VIEWER',
            'department' => 'ADMINISTRATION',
            'position' => 'Test User',
            'employee_id' => 'TEST-001',
            'is_active' => false,
            'is_verified' => false,
            'notes' => 'Inactive test user account',
            'created_by' => $superAdmin->id,
        ]);

        User::create([
            'username' => 'suspended.user',
            'email' => 'suspended@barangay.gov.ph',
            'password' => Hash::make('Suspended123!'),
            'first_name' => 'Suspended',
            'last_name' => 'User',
            'phone' => '+639171234591',
            'role' => 'DATA_ENCODER',
            'department' => 'RECORDS_MANAGEMENT',
            'position' => 'Test User',
            'employee_id' => 'TEST-002',
            'is_active' => false,
            'is_verified' => true,
            'email_verified_at' => now(),
            'notes' => 'Suspended test user account',
            'created_by' => $superAdmin->id,
        ]);

        // Update some users with last login times to create realistic data
        $usersToUpdate = User::whereIn('role', ['SUPER_ADMIN', 'ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_SECRETARY'])
            ->get();

        foreach ($usersToUpdate as $user) {
            $user->update([
                'last_login_at' => now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59)),
            ]);
        }

        $this->command->info('User seeder completed successfully!');
        $this->command->info('Created users:');
        $this->command->info('- 1 Super Admin (username: superadmin)');
        $this->command->info('- 1 Admin (username: admin)');
        $this->command->info('- 1 Barangay Captain (username: captain.santos)');
        $this->command->info('- 1 Barangay Secretary (username: secretary.rodriguez)');
        $this->command->info('- 1 Barangay Treasurer (username: treasurer.mendoza)');
        $this->command->info('- 7 Barangay Councilors');
        $this->command->info('- 1 Barangay Clerk (username: clerk.assistant)');
        $this->command->info('- 1 Health Worker (username: health.worker)');
        $this->command->info('- 1 Social Worker (username: social.worker)');
        $this->command->info('- 1 Security Officer (username: security.officer)');
        $this->command->info('- 2 Data Encoders');
        $this->command->info('- 2 Viewers');
        $this->command->info('- 2 Test users (inactive/suspended)');
        $this->command->info('');
        $this->command->info('Default password for all users: [Role]123! (e.g., SuperAdmin123!, Captain123!)');
        $this->command->info('Email format: [username]@barangay.gov.ph');
    }
}