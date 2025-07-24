<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Schemas\UserSchema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Personal Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();

            // Contact Information
            $table->string('email')->unique();
            $table->string('phone', 20);

            // Account Information
            $table->string('username', 50)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');

            // Role & Department Information
            $table->enum('role', UserSchema::ROLES);
            $table->enum('department', UserSchema::DEPARTMENTS);
            $table->string('position')->nullable();
            $table->string('employee_id', 100)->nullable()->index();

            // Status & Verification
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->timestamp('last_login_at')->nullable();

            // Additional Information
            $table->text('notes')->nullable();

            // System Fields
            $table->rememberToken();
            
            // Audit Fields
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes for better performance
            $table->index(['role', 'department']);
            $table->index(['is_active', 'is_verified']);
            $table->index('last_login_at');
            $table->index('created_at');
            
            // Composite indexes for common queries
            $table->index(['role', 'is_active']);
            $table->index(['department', 'is_active']);
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