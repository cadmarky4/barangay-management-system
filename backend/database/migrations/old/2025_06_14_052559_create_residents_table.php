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
        Schema::create('residents', function (Blueprint $table) {
            $table->id();
            
            // Basic Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('suffix', 10)->nullable();
            $table->date('birth_date');
            $table->integer('age')->nullable(); // Computed from birth_date
            $table->string('birth_place');
            $table->enum('gender', ['MALE', 'FEMALE']);
            $table->enum('civil_status', ['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED']);
            $table->string('nationality', 100);
            $table->string('religion', 100)->nullable();
            
            // Contact Information
            $table->string('mobile_number', 20)->nullable();
            $table->string('telephone_number', 20)->nullable();
            $table->string('email_address')->nullable();
            
            // Address Information
            $table->string('house_number', 50)->nullable();
            $table->string('street', 100)->nullable();
            $table->string('purok', 100)->nullable();
            $table->string('barangay', 100)->nullable();
            $table->string('municipality', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('zip_code', 10)->nullable();
            $table->text('complete_address');
            
            // Government IDs & Documents
            $table->string('primary_id_type', 100)->nullable();
            $table->string('id_number', 100)->nullable();
            $table->string('philhealth_number', 20)->nullable();
            $table->string('sss_number', 20)->nullable();
            $table->string('tin_number', 20)->nullable();
            $table->string('voters_id_number', 20)->nullable();
            $table->enum('voter_status', ['REGISTERED', 'NOT_REGISTERED', 'DECEASED', 'TRANSFERRED'])->default('NOT_REGISTERED');
            $table->string('precinct_number', 20)->nullable();
            
            // Family Information
            $table->foreignId('household_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('is_household_head')->default(false);
            $table->string('relationship_to_head', 100)->nullable();
            $table->string('mother_name')->nullable();
            $table->string('father_name')->nullable();
            
            // Emergency Contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_number', 20)->nullable();
            $table->string('emergency_contact_relationship', 100)->nullable();
            
            // Employment Information
            $table->string('occupation')->nullable();
            $table->string('employer')->nullable();
            $table->decimal('monthly_income', 10, 2)->nullable();
            $table->enum('employment_status', ['EMPLOYED', 'UNEMPLOYED', 'SELF_EMPLOYED', 'RETIRED', 'STUDENT', 'OFW'])->nullable();
            $table->string('educational_attainment')->nullable();
            
            // Health & Medical Information
            $table->text('medical_conditions')->nullable();
            $table->text('allergies')->nullable();
            
            // Special Classifications
            $table->boolean('senior_citizen')->default(false);
            $table->boolean('person_with_disability')->default(false);
            $table->string('disability_type')->nullable();
            $table->boolean('indigenous_people')->default(false);
            $table->string('indigenous_group')->nullable();
            $table->boolean('four_ps_beneficiary')->default(false);
            $table->string('four_ps_household_id', 50)->nullable();
            
            // System Fields
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'DECEASED'])->default('ACTIVE');
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['first_name', 'last_name']);
            $table->index('birth_date');
            $table->index('status');
            $table->index('voter_status');
            $table->index(['barangay', 'purok']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('residents');
    }
};
