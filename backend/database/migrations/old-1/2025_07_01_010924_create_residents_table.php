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
            $table->uuid('id')->primary();

            // Basic Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('suffix')->nullable();
            $table->date('birth_date');
            $table->integer('age')->nullable(); // Auto-calculated but stored for quick queries
            $table->string('birth_place');
            
            // Enums for demographics
            $table->enum('gender', ['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']);
            $table->enum('civil_status', [
                'SINGLE', 'LIVE_IN', 'MARRIED', 'WIDOWED', 
                'DIVORCED', 'SEPARATED', 'ANNULLED', 'PREFER_NOT_TO_SAY'
            ]);
            $table->enum('nationality', [
                'FILIPINO', 'AMERICAN', 'BRITISH', 'CANADIAN', 'AUSTRALIAN', 'OTHER'
            ]);
            $table->enum('religion', [
                'CATHOLIC', 'IGLESIA_NI_CRISTO', 'EVANGELICAL', 'PROTESTANT', 'ISLAM',
                'BUDDHIST', 'HINDU', 'SEVENTH_DAY_ADVENTIST', 'JEHOVAHS_WITNESS',
                'BORN_AGAIN_CHRISTIAN', 'ORTHODOX', 'JUDAISM', 'ATHEIST', 'AGLIPAYAN',
                'OTHER', 'PREFER_NOT_TO_SAY'
            ]);

            // Employment and Education
            $table->enum('educational_attainment', [
                'NO_FORMAL_EDUCATION', 'ELEMENTARY_UNDERGRADUATE', 'ELEMENTARY_GRADUATE',
                'HIGH_SCHOOL_UNDERGRADUATE', 'HIGH_SCHOOL_GRADUATE', 'COLLEGE_UNDERGRADUATE',
                'COLLEGE_GRADUATE', 'POST_GRADUATE', 'VOCATIONAL', 'OTHER'
            ]);
            $table->enum('employment_status', [
                'EMPLOYED', 'UNEMPLOYED', 'SELF_EMPLOYED', 'RETIRED', 'STUDENT', 'OFW'
            ]);
            $table->string('occupation')->nullable();
            $table->string('employer')->nullable();

            // Contact Information
            $table->string('mobile_number')->nullable();
            $table->string('landline_number')->nullable();
            $table->string('email_address')->nullable();

            // Address Information
            $table->string('region')->nullable();
            $table->string('province')->nullable();
            $table->string('city')->nullable();
            $table->string('barangay')->nullable();
            $table->string('house_number')->nullable();
            $table->string('street')->nullable();
            $table->text('complete_address');

            // Family Information
            $table->string('mother_name')->nullable();
            $table->string('father_name')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_number')->nullable();
            $table->string('emergency_contact_relationship')->nullable();

            // Government IDs
            $table->string('primary_id_type')->nullable();
            $table->string('id_number')->nullable();
            $table->string('philhealth_number')->nullable();
            $table->string('sss_number')->nullable();
            $table->string('tin_number')->nullable();
            $table->string('voters_id_number')->nullable();
            $table->enum('voter_status', ['NOT_REGISTERED', 'REGISTERED', 'DECEASED', 'TRANSFERRED']);
            $table->string('precinct_number')->nullable();

            // Health & Medical
            $table->text('medical_conditions')->nullable();
            $table->text('allergies')->nullable();

            // Special Classifications
            $table->boolean('senior_citizen')->default(false);
            $table->boolean('person_with_disability')->default(false);
            $table->string('disability_type')->nullable();
            $table->boolean('indigenous_people')->default(false);
            $table->string('indigenous_group')->nullable();
            $table->boolean('four_ps_beneficiary')->default(false);
            $table->string('four_ps_household_id')->nullable();

            // Profile photo
            $table->string('profile_photo_url')->nullable();

            // Status
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'DECEASED', 'TRANSFERRED'])->default('ACTIVE');

            // Audit fields
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes for better performance
            $table->index(['first_name', 'last_name']);
            $table->index(['gender', 'civil_status']);
            $table->index(['employment_status', 'educational_attainment']);
            $table->index(['senior_citizen', 'person_with_disability', 'indigenous_people', 'four_ps_beneficiary']);
            $table->index(['voter_status', 'precinct_number']);
            $table->index(['birth_date', 'age']);
            $table->index('created_at');
            
            // Composite indexes for common queries
            $table->index(['status', 'senior_citizen']);
            $table->index(['status', 'person_with_disability']);
            $table->index(['barangay', 'status']);
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