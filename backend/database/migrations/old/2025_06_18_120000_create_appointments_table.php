<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Schemas\AppointmentSchema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            
            // Basic Information (matching frontend)
            $table->string('appointment_number')->unique();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone', 20);
            $table->string('department');
            $table->text('purpose');
            
            // Scheduling Information
            $table->date('preferred_date');
            $table->string('preferred_time', 10);
            $table->date('alternative_date')->nullable();
            $table->string('alternative_time', 10)->nullable();
            $table->text('additional_notes')->nullable();
            
            // System Processing Fields
            $table->date('appointment_date')->nullable(); // Final confirmed date
            $table->time('appointment_time')->nullable(); // Final confirmed time
            $table->time('end_time')->nullable();
            $table->integer('duration_minutes')->nullable();
            
            // Location & Assignment
            $table->string('location')->nullable();
            $table->string('room_venue')->nullable();
            $table->foreignId('assigned_official')->nullable()->constrained('users');
            $table->string('assigned_official_name')->nullable();
            
            // Status & Dates
            $table->enum('status', ['PENDING', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])->default('PENDING');
            $table->date('date_requested')->nullable();
            // $table->date('date_requested');
            $table->datetime('confirmed_date')->nullable();
            $table->datetime('actual_start_time')->nullable();
            $table->datetime('actual_end_time')->nullable();
            
            // Rescheduling
            $table->date('original_date')->nullable();
            $table->time('original_time')->nullable();
            $table->text('reschedule_reason')->nullable();
            $table->integer('reschedule_count')->default(0);
            
            // Requirements & Documents
            $table->json('required_documents')->nullable();
            $table->json('documents_submitted')->nullable();
            $table->text('special_requirements')->nullable();
            $table->boolean('all_requirements_met')->default(false);
            
            // Meeting Details
            $table->text('meeting_notes')->nullable();
            $table->text('action_items')->nullable();
            $table->text('outcome_summary')->nullable();
            $table->enum('resolution_status', ['PENDING', 'RESOLVED', 'ONGOING', 'ESCALATED'])->nullable();
            
            // Follow-up
            $table->boolean('requires_followup')->default(false);
            $table->date('followup_date')->nullable();
            $table->text('followup_notes')->nullable();
            $table->foreignId('followup_assigned_to')->nullable()->constrained('users');
            
            // Priority & Special Flags
            $table->enum('priority', ['LOW', 'NORMAL', 'HIGH', 'URGENT'])->default('NORMAL');
            $table->boolean('is_walk_in')->default(false);
            $table->boolean('is_emergency')->default(false);
            
            // Notifications
            $table->boolean('confirmation_sent')->default(false);
            $table->boolean('reminder_sent')->default(false);
            $table->datetime('confirmation_sent_at')->nullable();
            $table->datetime('reminder_sent_at')->nullable();
            $table->enum('preferred_contact_method', ['EMAIL', 'SMS', 'PHONE', 'IN_PERSON'])->nullable();
            
            // Feedback
            $table->integer('service_rating')->nullable();
            $table->text('appointee_feedback')->nullable();
            $table->boolean('feedback_received')->default(false);
            
            // Additional
            $table->json('attachments')->nullable();
            $table->string('reference_number', 100)->nullable();
            $table->text('remarks')->nullable();
            
            // System Fields
            $table->foreignId('resident_id')->nullable()->constrained('residents');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            
            $table->timestamps();
            
            // Indexes
            $table->index(['appointment_date', 'status']);
            $table->index(['preferred_date']);
            $table->index(['status']);
            $table->index(['department']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
