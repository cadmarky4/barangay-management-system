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
        Schema::create('barangay_officials', function (Blueprint $table) {
            $table->id();
            
            // Personal Information (based on frontend form)
            $table->string('prefix', 10)->nullable(); // Mr., Ms., Mrs., Dr., Hon.
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->enum('gender', ['Male', 'Female']);
            $table->date('birth_date')->nullable();
            $table->string('contact_number');
            $table->string('email_address')->nullable();
            $table->text('complete_address')->nullable();
            $table->enum('civil_status', ['Single', 'Married', 'Divorced', 'Widowed'])->nullable();
            $table->text('educational_background')->nullable();
            
            // Position Information  
            $table->enum('position', [
                'BARANGAY_CAPTAIN', 'BARANGAY_SECRETARY', 'BARANGAY_TREASURER', 
                'KAGAWAD', 'SK_CHAIRPERSON', 'SK_KAGAWAD', 'BARANGAY_CLERK', 'BARANGAY_TANOD'
            ]);
            $table->string('position_title')->nullable();
            
            // Committee Information (based on frontend dropdown)
            $table->enum('committee_assignment', [
                'Health', 'Education', 'Public Safety', 'Environment', 
                'Peace and Order', 'Sports and Recreation', 'Women and Family', 'Senior Citizens'
            ])->nullable();
            
            // Term Information
            $table->date('term_start');
            $table->date('term_end');
            $table->integer('term_number')->default(1);
            $table->boolean('is_current_term')->default(true);
            
            // Election Information  
            $table->date('election_date')->nullable();
            $table->integer('votes_received')->nullable();
            $table->boolean('is_elected')->default(true);
            $table->string('appointment_document')->nullable();
            
            // Status
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED', 'DECEASED'])->default('ACTIVE');
            $table->date('status_date')->nullable();
            $table->text('status_reason')->nullable();
            
            // Additional fields
            $table->text('work_experience')->nullable();
            $table->text('skills_expertise')->nullable();
            $table->json('trainings_attended')->nullable();
            $table->json('certifications')->nullable();
            $table->text('major_accomplishments')->nullable();
            $table->json('projects_initiated')->nullable();
            $table->text('performance_notes')->nullable();
            $table->integer('performance_rating')->nullable()->comment('1-5 rating');
            
            // Emergency Contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_number')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            
            // Files
            $table->string('profile_photo')->nullable();
            $table->json('documents')->nullable();
            
            // Oath Information
            $table->date('oath_taking_date')->nullable();
            $table->text('oath_taking_notes')->nullable();
            
            // System fields
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            
            $table->timestamps();
            
            // Indexes
            $table->index('position');
            $table->index('status');
            $table->index(['term_start', 'term_end']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barangay_officials');
    }
};
