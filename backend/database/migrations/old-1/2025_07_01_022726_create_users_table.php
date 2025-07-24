<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Authentication fields
            $table->string('username', 50)->unique();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            
            // Personal Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            
            // Contact Information
            $table->string('phone', 20);
            
            // Role and Department
            $table->enum('role', [
                'SUPER_ADMIN',
                'ADMIN',
                'BARANGAY_CAPTAIN',
                'BARANGAY_SECRETARY',
                'BARANGAY_TREASURER',
                'BARANGAY_COUNCILOR',
                'BARANGAY_CLERK',
                'HEALTH_WORKER',
                'SOCIAL_WORKER',
                'SECURITY_OFFICER',
                'DATA_ENCODER',
                'VIEWER'
            ]);
            
            $table->enum('department', [
                'ADMINISTRATION',
                'HEALTH_SERVICES',
                'SOCIAL_SERVICES',
                'SECURITY_PUBLIC_SAFETY',
                'FINANCE_TREASURY',
                'RECORDS_MANAGEMENT',
                'COMMUNITY_DEVELOPMENT',
                'DISASTER_RISK_REDUCTION',
                'ENVIRONMENTAL_MANAGEMENT',
                'YOUTH_SPORTS_DEVELOPMENT',
                'SENIOR_CITIZEN_AFFAIRS',
                'WOMENS_AFFAIRS',
                'BUSINESS_PERMITS',
                'INFRASTRUCTURE_DEVELOPMENT'
            ]);
            
            $table->string('position')->nullable();
            $table->string('employee_id', 50)->nullable()->unique();
            
            // Status and Settings
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->timestamp('last_login_at')->nullable();
            
            // Additional Information
            $table->text('notes')->nullable();
            
            // Relationship to resident (nullable because not all users are residents)
            $table->foreignId('resident_id')->nullable()->constrained('residents')->onDelete('set null');
            
            // Audit fields
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['role', 'department']);
            $table->index(['is_active', 'is_verified']);
            $table->index('last_login_at');
            $table->index('resident_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};