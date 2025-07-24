<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // Residents
            'view-residents',
            'create-residents',
            'edit-residents',
            'delete-residents',
            'export-residents',
            
            // Households
            'view-households',
            'create-households',
            'edit-households',
            'delete-households',
            
            // Documents
            'view-documents',
            'create-documents',
            'process-documents',
            'approve-documents',
            'release-documents',
            'delete-documents',
            
            // Projects
            'view-projects',
            'create-projects',
            'edit-projects',
            'delete-projects',
            'manage-project-team',
            
            // Help Desk
            'view-complaints',
            'create-complaints',
            'assign-complaints',
            'resolve-complaints',
            'view-suggestions',
            'review-suggestions',
            'view-blotter-cases',
            'create-blotter-cases',
            'investigate-blotter-cases',
            'mediate-blotter-cases',
            'view-appointments',
            'create-appointments',
            'manage-appointments',
            
            // Barangay Officials
            'view-officials',
            'create-officials',
            'edit-officials',
            'delete-officials',
            
            // Reports and Analytics
            'view-reports',
            'generate-reports',
            'view-analytics',
            
            // System Administration
            'manage-users',
            'manage-roles',
            'system-settings',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        
        // Super Admin - all permissions
        $superAdmin = Role::create(['name' => 'super-admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // Barangay Captain - most permissions except system admin
        $captain = Role::create(['name' => 'barangay-captain']);
        $captain->givePermissionTo([
            'view-residents', 'create-residents', 'edit-residents', 'export-residents',
            'view-households', 'create-households', 'edit-households',
            'view-documents', 'create-documents', 'process-documents', 'approve-documents', 'release-documents',
            'view-projects', 'create-projects', 'edit-projects', 'manage-project-team',
            'view-complaints', 'assign-complaints', 'resolve-complaints',
            'view-suggestions', 'review-suggestions',
            'view-blotter-cases', 'create-blotter-cases', 'investigate-blotter-cases', 'mediate-blotter-cases',
            'view-appointments', 'create-appointments', 'manage-appointments',
            'view-officials', 'create-officials', 'edit-officials',
            'view-reports', 'generate-reports', 'view-analytics',
        ]);

        // Barangay Secretary - document processing, residents, households
        $secretary = Role::create(['name' => 'barangay-secretary']);
        $secretary->givePermissionTo([
            'view-residents', 'create-residents', 'edit-residents',
            'view-households', 'create-households', 'edit-households',
            'view-documents', 'create-documents', 'process-documents', 'release-documents',
            'view-appointments', 'create-appointments', 'manage-appointments',
            'view-complaints', 'create-complaints',
            'view-reports',
        ]);

        // Barangay Kagawad - limited access
        $kagawad = Role::create(['name' => 'barangay-kagawad']);
        $kagawad->givePermissionTo([
            'view-residents', 'view-households',
            'view-documents', 'create-documents',
            'view-projects', 'view-complaints',
            'view-suggestions', 'review-suggestions',
            'view-blotter-cases', 'mediate-blotter-cases',
            'view-appointments',
            'view-reports',
        ]);

        // Barangay Clerk - data entry and basic operations
        $clerk = Role::create(['name' => 'barangay-clerk']);
        $clerk->givePermissionTo([
            'view-residents', 'create-residents', 'edit-residents',
            'view-households', 'create-households', 'edit-households',
            'view-documents', 'create-documents', 'process-documents',
            'view-appointments', 'create-appointments',
            'view-complaints', 'create-complaints',
        ]);

        // Regular User - basic viewing and personal requests
        $user = Role::create(['name' => 'user']);
        $user->givePermissionTo([
            'view-documents', 'create-documents',
            'view-appointments', 'create-appointments',
            'view-complaints', 'create-complaints',
            'view-suggestions',
        ]);
    }
}
