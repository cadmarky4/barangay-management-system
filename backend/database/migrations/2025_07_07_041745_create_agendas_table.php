<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Schemas\AgendaSchema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('agendas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Basic Information
            $table->string('title');
            $table->text('description')->nullable();
            
            // Schedule Information
            $table->date('date');
            $table->time('time');
            $table->time('end_time')->nullable();
            $table->integer('duration_minutes')->default(60)->nullable();
            
            // Categorization
            $table->enum('category', ['MEETING', 'REVIEW', 'PRESENTATION', 'EVALUATION', 'BUDGET', 'PLANNING', 'INSPECTION', 'OTHER'])->default('MEETING');
            $table->enum('priority', ['LOW', 'NORMAL', 'HIGH', 'URGENT'])->default('NORMAL');
            $table->enum('status', ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'])->default('SCHEDULED');
            
            // Location Information
            $table->string('location')->nullable();
            $table->string('venue')->nullable();
            
            // Participants
            $table->json('participants')->nullable();
            $table->string('organizer')->nullable();
            
            // Additional Information
            $table->text('notes')->nullable();
            $table->json('attachments')->nullable();
            
            // Notification settings
            $table->boolean('reminder_enabled')->default(true);
            $table->integer('reminder_minutes_before')->default(15);
            
            // System tracking
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Indexes for performance
            $table->index(['date', 'time']);
            $table->index('category');
            $table->index('priority');
            $table->index('status');
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agendas');
    }
};
