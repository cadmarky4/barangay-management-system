<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('ticket_number', 50)->unique();
            $table->string('subject', 255);
            $table->text('description');
            $table->enum('priority', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
            $table->string('requester_name', 255)->nullable();
            $table->uuid('resident_id')->nullable();
            $table->string('contact_number', 20)->nullable();
            $table->string('email_address', 255)->nullable();
            $table->string('complete_address', 255)->nullable();
            $table->enum('category', ['APPOINTMENT', 'BLOTTER', 'COMPLAINT', 'SUGGESTION']);
            $table->enum('status', ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'])->default('OPEN');
            $table->timestamps();

            // Indexes
            $table->index('category');
            $table->index('status');
            $table->index('created_at');

            // Foreign key (assuming residents table exists)
            $table->foreign('resident_id')
                ->references('id')
                ->on('residents')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
