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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            
            // Basic Project Information
            $table->string('project_code')->unique()->nullable();
            $table->string('title');
            $table->text('description');
            $table->text('objectives')->nullable();
            $table->text('expected_outcomes')->nullable();
            
            // Categorization
            $table->string('category');
            $table->string('type')->nullable();
            $table->enum('priority', ['high', 'medium', 'low'])->default('medium');
            
            // Timeline
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->date('actual_start_date')->nullable();
            $table->date('actual_end_date')->nullable();
            $table->integer('duration_days')->nullable();
            
            // Budget Information
            $table->decimal('total_budget', 15, 2)->default(0);
            $table->decimal('allocated_budget', 15, 2)->default(0);
            $table->decimal('utilized_budget', 15, 2)->default(0);
            $table->decimal('remaining_budget', 15, 2)->default(0);
            $table->string('funding_source')->nullable();
            $table->string('funding_agency')->nullable();
            
            // Location & Beneficiaries
            $table->string('location')->nullable();
            $table->json('target_puroks')->nullable();
            $table->integer('target_beneficiaries')->default(0);
            $table->integer('actual_beneficiaries')->default(0);
            $table->text('beneficiary_criteria')->nullable();
            
            // Status & Progress
            $table->enum('status', ['Active', 'Pending', 'Completed'])->default('Pending');
            $table->integer('progress_percentage')->default(0);
            
            // Team Information
            $table->integer('team_size')->default(0);
            $table->foreignId('project_manager_id')->nullable()->constrained('users');
            $table->foreignId('approving_official_id')->nullable()->constrained('users');
            $table->date('approved_date')->nullable();
            
            // Documentation
            $table->json('attachments')->nullable();
            $table->text('remarks')->nullable();
            $table->text('completion_report')->nullable();
            $table->json('lessons_learned')->nullable();
            
            // Monitoring & Evaluation
            $table->date('last_monitoring_date')->nullable();
            $table->text('monitoring_remarks')->nullable();
            $table->integer('quality_rating')->nullable();
            $table->text('evaluation_notes')->nullable();
            
            // Audit trail
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            
            $table->timestamps();
            
            // Indexes
            $table->index(['status']);
            $table->index(['priority']);
            $table->index(['category']);
            $table->index(['start_date']);
            $table->index(['end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
