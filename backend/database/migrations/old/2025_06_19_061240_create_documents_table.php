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
        Schema::dropIfExists('documents');

        Schema::create('documents', function (Blueprint $table) {
            // Primary key
            $table->id();
            
            // Basic Document Information
            $table->string('document_type');
            $table->unsignedBigInteger('resident_id');
            $table->string('applicant_name');
            $table->text('purpose');
            
            // Contact Information
            $table->text('applicant_address')->nullable();
            $table->string('applicant_contact')->nullable();
            $table->string('applicant_email')->nullable();
            
            // Request Details
            $table->string('priority'); // normal, urgent, rush
            $table->date('needed_date')->nullable();
            $table->decimal('processing_fee', 10, 2)->default(0);
            
            // Document Status and Payment
            $table->string('status')->default('pending'); // pending, processing, approved, released, rejected
            $table->string('payment_status')->default('unpaid'); // unpaid, paid, waived
            
            // System tracking fields
            $table->string('document_number')->nullable()->unique();
            $table->string('serial_number')->nullable()->unique();
            $table->timestamp('request_date')->useCurrent();
            $table->timestamp('processed_date')->nullable();
            $table->timestamp('approved_date')->nullable();
            $table->timestamp('released_date')->nullable();
            
            // Document Specific Fields (Barangay Clearance)
            $table->string('clearance_purpose')->nullable();
            $table->string('clearance_type')->nullable();
            
            // Document Specific Fields (Business Permit)
            $table->string('business_name')->nullable();
            $table->string('business_type')->nullable();
            $table->text('business_address')->nullable();
            $table->string('business_owner')->nullable();
            
            // Document Specific Fields (Certificate of Indigency)
            $table->text('indigency_reason')->nullable();
            $table->decimal('monthly_income', 10, 2)->nullable();
            $table->integer('family_size')->nullable();
            
            // Document Specific Fields (Certificate of Residency)
            $table->string('residency_period')->nullable();
            $table->text('previous_address')->nullable();
            
            // Processing Information
            $table->json('requirements_submitted')->nullable();
            $table->text('notes')->nullable();
            $table->text('remarks')->nullable();
            
            // Officials
            $table->string('certifying_official')->nullable();
            $table->unsignedBigInteger('processed_by')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->unsignedBigInteger('released_by')->nullable();
            
            // Additional tracking
            $table->date('expiry_date')->nullable();
            
            // Laravel timestamps
            $table->timestamps();
            
            // Foreign key constraints
            $table->foreign('resident_id')->references('id')->on('residents')->onDelete('cascade');
            $table->foreign('processed_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('released_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes for better performance
            $table->index(['document_type', 'status']);
            $table->index(['resident_id', 'document_type']);
            $table->index('request_date');
            $table->index('status');
            $table->index('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};