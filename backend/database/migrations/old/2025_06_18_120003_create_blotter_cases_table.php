<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Schemas\BlotterCaseSchema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('blotters', function (Blueprint $table) {
            $table->id();
            
            // Basic Case Information
            $table->string('case_number')->unique();
            // $table->string('case_title');
            $table->string('case_title')->nullable();
            // $table->text('case_description');
            $table->text('case_description')->nullable();
            $table->enum('case_type', ['CIVIL', 'CRIMINAL', 'ADMINISTRATIVE', 'DISPUTE', 'COMPLAINT', 'NOISE', 'BOUNDARY', 'DOMESTIC', 'OTHERS'])->nullable();
            // $table->enum('case_type', ['CIVIL', 'CRIMINAL', 'ADMINISTRATIVE', 'DISPUTE', 'COMPLAINT', 'NOISE', 'BOUNDARY', 'DOMESTIC', 'OTHERS']);
            
            // Complainant Information (based on frontend fields)
            // $table->string('complainant_name');
            $table->string('complainant_name')->nullable();
            $table->string('complainant_contact', 20)->nullable();
            // $table->text('complainant_address');
            $table->text('complainant_address')->nullable();
            $table->string('complainant_email')->nullable();
            
            // Incident Details (based on frontend fields)
            $table->enum('incident_type', ['Theft', 'Physical Assault', 'Verbal Assault', 'Property Damage', 'Disturbance', 'Trespassing', 'Fraud', 'Harassment', 'Domestic Dispute', 'Noise Complaint', 'Other'])->nullable();
            // $table->enum('incident_type', ['Theft', 'Physical Assault', 'Verbal Assault', 'Property Damage', 'Disturbance', 'Trespassing', 'Fraud', 'Harassment', 'Domestic Dispute', 'Noise Complaint', 'Other']);
            // $table->date('incident_date');
            $table->date('incident_date')->nullable();
            $table->time('incident_time')->nullable();
            // $table->string('incident_location');
            $table->string('incident_location')->nullable();
            // $table->text('incident_description');
            $table->text('incident_description')->nullable();
            $table->text('witnesses')->nullable();
            $table->text('evidence')->nullable();
            
            // Respondent Information (based on frontend fields)
            $table->string('respondent_name')->nullable();
            $table->string('respondent_contact', 20)->nullable();
            $table->text('respondent_address')->nullable();
            
            // Case Status & Processing
            $table->enum('status', ['FILED', 'UNDER_INVESTIGATION', 'MEDIATION', 'HEARING_SCHEDULED', 'SETTLED', 'DISMISSED', 'REFERRED_TO_COURT', 'CLOSED'])->default('FILED');
            // $table->date('date_filed');
            $table->date('date_filed')->nullable();
            
            // Hearing Information
            $table->date('hearing_date')->nullable();
            $table->time('hearing_time')->nullable();
            $table->string('hearing_location')->nullable();
            
            // Personnel Assignment
            $table->foreignId('investigating_officer')->nullable()->constrained('users');
            $table->foreignId('mediator_assigned')->nullable()->constrained('users');
            $table->json('lupon_members')->nullable();
            
            // Resolution
            $table->text('settlement_agreement')->nullable();
            $table->date('settlement_date')->nullable();
            $table->enum('resolution_type', ['AMICABLE_SETTLEMENT', 'MEDIATION', 'ARBITRATION', 'COURT_REFERRAL', 'DISMISSAL'])->nullable();
            
            // Documents & Reports
            $table->json('attachments')->nullable();
            $table->text('investigation_report')->nullable();
            $table->text('mediation_notes')->nullable();
            $table->json('court_documents')->nullable();
            
            // Follow-up & Monitoring
            $table->boolean('requires_monitoring')->default(false);
            $table->date('next_followup_date')->nullable();
            $table->text('followup_notes')->nullable();
            $table->enum('compliance_status', ['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT', 'PENDING'])->nullable();
            
            // Priority & Classification
            $table->enum('priority', ['LOW', 'NORMAL', 'HIGH', 'URGENT'])->default('NORMAL');
            $table->boolean('is_confidential')->default(false);
            $table->json('tags')->nullable();
            
            // Additional Information
            $table->text('remarks')->nullable();
            $table->text('legal_basis')->nullable();
            $table->text('penalties_imposed')->nullable();
            
            // System Fields
            $table->foreignId('complainant_resident_id')->nullable()->constrained('residents');
            $table->foreignId('respondent_resident_id')->nullable()->constrained('residents');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            
            $table->timestamps();
            
            // Indexes
            $table->index(['status']);
            $table->index(['case_type']);
            $table->index(['incident_type']);
            $table->index(['date_filed']);
            $table->index(['priority']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blotters');
    }
};
