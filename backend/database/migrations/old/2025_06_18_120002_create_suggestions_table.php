<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Schemas\SuggestionSchema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('suggestions', function (Blueprint $table) {
            $table->id();
            
            // Basic Information (matching frontend)
            $table->string('suggestion_number')->unique();
            $table->string('title');
            $table->text('description');
            $table->enum('category', ['Community Development', 'Infrastructure Improvement', 'Environmental Protection', 'Public Safety', 'Health Services', 'Education', 'Tourism and Culture', 'Economic Development', 'Digital Services', 'Transportation', 'Social Welfare', 'Youth and Sports', 'Senior Citizens Affairs', 'Other']);
            
            // Suggester Information (based on frontend fields)
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone', 20)->nullable();
            $table->enum('is_resident', ['yes', 'no'])->default('yes');
            
            // Suggestion Details (based on frontend fields)
            $table->text('benefits')->nullable();
            $table->text('implementation')->nullable();
            $table->string('resources')->nullable();
            
            // Priority & Classification (based on frontend)
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->boolean('allow_contact')->default(true);
            
            // Status & Processing
            $table->enum('status', ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'IMPLEMENTED', 'DEFERRED'])->default('SUBMITTED');
            $table->date('date_submitted');
            $table->date('review_date')->nullable();
            $table->date('decision_date')->nullable();
            $table->date('implementation_date')->nullable();
            
            // Review & Decision
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->text('review_comments')->nullable();
            $table->text('decision_remarks')->nullable();
            $table->integer('feasibility_rating')->nullable();
            $table->integer('impact_rating')->nullable();
            
            // Implementation
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->text('implementation_plan')->nullable();
            $table->enum('implementation_status', ['NOT_STARTED', 'PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'])->nullable();
            $table->integer('implementation_progress')->default(0);
            
            // Community Engagement
            $table->integer('upvotes')->default(0);
            $table->integer('downvotes')->default(0);
            $table->json('community_comments')->nullable();
            
            // Documentation
            $table->json('attachments')->nullable();
            $table->json('supporting_documents')->nullable();
            
            // Budget & Resources
            $table->decimal('approved_budget', 12, 2)->nullable();
            $table->decimal('actual_cost', 12, 2)->nullable();
            $table->string('funding_source')->nullable();
            $table->text('resource_requirements')->nullable();
            
            // Tracking & Monitoring
            $table->json('milestones')->nullable();
            $table->text('success_metrics')->nullable();
            $table->text('outcome_assessment')->nullable();
            $table->text('lessons_learned')->nullable();
            
            // Additional Classification
            $table->enum('complexity', ['SIMPLE', 'MODERATE', 'COMPLEX', 'VERY_COMPLEX'])->nullable();
            $table->json('stakeholders_involved')->nullable();
            
            // Communication & Updates
            $table->boolean('public_visibility')->default(true);
            $table->enum('update_frequency', ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'AS_NEEDED'])->default('MONTHLY');
            $table->text('communication_plan')->nullable();
            
            // Risk & Dependencies
            $table->text('risks_identified')->nullable();
            $table->text('dependencies')->nullable();
            $table->text('mitigation_strategies')->nullable();
            
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
            $table->index(['category']);
            $table->index(['priority']);
            $table->index(['date_submitted']);
            $table->index(['implementation_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suggestions');
    }
};
