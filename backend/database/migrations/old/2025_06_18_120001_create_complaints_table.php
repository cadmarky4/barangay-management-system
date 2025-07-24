<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Schemas\ComplaintSchema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            
            // Basic Information (matching frontend)
            $table->string('complaint_number')->unique();
            $table->string('full_name')->nullable(); // null when anonymous
            $table->string('email')->nullable();
            $table->string('phone', 20)->nullable(); // null when anonymous
            $table->text('address')->nullable();
            $table->boolean('anonymous')->default(false);
              // Complaint Details (based on frontend fields)
            // $table->enum('complaint_category', ['Public Services', 'Infrastructure', 'Health and Sanitation', 'Education', 'Social Welfare', 'Environmental Concerns', 'Public Safety', 'Government Services', 'Corruption/Misconduct', 'Other']);
            // adrian san mahahanap yung mga insert into dito?
            $table->enum('complaint_category', ['Public Services', 'Infrastructure', 'Health and Sanitation', 'Education', 'Social Welfare', 'Environmental Concerns', 'Public Safety', 'Government Services', 'Corruption/Misconduct', 'Other'])->nullable();
            $table->enum('department', ['Mayors Office', 'Engineering Department', 'Health Department', 'Social Welfare', 'Treasury', 'Human Resources', 'Environmental Management', 'Public Safety', 'Education', 'General Services'])->nullable();
            $table->string('subject');
            $table->text('description');
            $table->string('location')->nullable();
            $table->enum('urgency', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->text('attachments')->nullable();
            
            // System Processing Fields
            $table->enum('priority', ['LOW', 'NORMAL', 'HIGH', 'URGENT'])->default('NORMAL');
            $table->enum('category', ['SERVICE_RELATED', 'OFFICIAL_MISCONDUCT', 'FACILITY_ISSUE', 'PROCESS_COMPLAINT', 'DISCRIMINATION', 'CORRUPTION', 'OTHERS'])->nullable();
            
            // Legacy fields for backward compatibility
            $table->string('complainant_name')->nullable();
            $table->string('complainant_contact', 20)->nullable();
            $table->string('complainant_email')->nullable();
            $table->text('complainant_address')->nullable();
            $table->boolean('is_anonymous')->default(false);
            
            // Incident Details
            $table->string('incident_location')->nullable();
            $table->date('incident_date')->nullable();
            $table->time('incident_time')->nullable();
            $table->json('persons_involved')->nullable();
            $table->json('witnesses')->nullable();
            
            // Status & Timeline
            $table->enum('status', ['RECEIVED', 'ACKNOWLEDGED', 'UNDER_REVIEW', 'INVESTIGATING', 'RESOLVED', 'CLOSED', 'DISMISSED'])->default('RECEIVED');
            // $table->date('date_received');
            $table->date('date_received')->nullable();
            $table->date('acknowledged_date')->nullable();
            $table->date('target_resolution_date')->nullable();
            $table->date('actual_resolution_date')->nullable();
            
            // Assignment & Investigation
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->foreignId('investigated_by')->nullable()->constrained('users');
            $table->string('assigned_department')->nullable();
            
            // Actions & Resolution
            $table->text('actions_taken')->nullable();
            $table->text('resolution_details')->nullable();
            $table->text('recommendations')->nullable();
            $table->enum('resolution_type', ['SATISFACTORY', 'PARTIAL', 'UNSATISFACTORY', 'DISMISSED', 'REFERRED'])->nullable();
            
            // Feedback & Satisfaction
            $table->integer('satisfaction_rating')->nullable();
            $table->text('complainant_feedback')->nullable();
            $table->boolean('is_feedback_received')->default(false);
            
            // Documents & Evidence
            $table->json('evidence_files')->nullable();
            $table->text('investigation_notes')->nullable();
            
            // Follow-up
            $table->boolean('requires_followup')->default(false);
            $table->date('followup_date')->nullable();
            $table->text('followup_notes')->nullable();
            
            // Classification & Tracking
            $table->boolean('is_valid')->nullable();
            $table->text('validity_assessment')->nullable();
            $table->boolean('is_escalated')->default(false);
            $table->text('escalation_reason')->nullable();
            $table->enum('escalation_level', ['SUPERVISOR', 'MANAGER', 'DIRECTOR', 'EXTERNAL_AGENCY'])->nullable();
            
            // Communication
            $table->json('communication_log')->nullable();
            $table->enum('preferred_contact_method', ['EMAIL', 'SMS', 'PHONE', 'IN_PERSON', 'MAIL'])->nullable();
            $table->json('updates_sent')->nullable();
            
            // Lessons & Improvements
            $table->text('lessons_learned')->nullable();
            $table->text('process_improvements')->nullable();
            $table->text('training_needs')->nullable();
            
            // Additional Information
            $table->text('remarks')->nullable();
            $table->text('internal_notes')->nullable();
            $table->json('tags')->nullable();
            
            // System Fields
            $table->foreignId('resident_id')->nullable()->constrained('residents');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            
            $table->timestamps();
            
            // Indexes
            $table->index(['status']);
            $table->index(['complaint_category']);
            $table->index(['urgency']);
            $table->index(['date_received']);
            $table->index(['department']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
