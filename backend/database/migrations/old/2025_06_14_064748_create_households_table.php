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
        Schema::create('households', function (Blueprint $table) {
            $table->id();
            
            // Household Identification
            $table->string('household_number', 50)->unique();
            $table->enum('household_type', ['nuclear', 'extended', 'single', 'single-parent', 'other']);
            $table->foreignId('head_resident_id')->nullable()->constrained('residents')->onDelete('set null');
            
            // Address Information
            $table->string('house_number', 50);
            $table->string('street_sitio', 100);
            $table->string('barangay', 100);
            $table->text('complete_address');
            
            // Socioeconomic Information
            $table->enum('monthly_income', ['below-10000', '10000-25000', '25000-50000', '50000-100000', 'above-100000'])->nullable();
            $table->string('primary_income_source', 255)->nullable();
            
            // Household Classification
            $table->boolean('four_ps_beneficiary')->default(false);
            $table->boolean('indigent_family')->default(false);
            $table->boolean('has_senior_citizen')->default(false);
            $table->boolean('has_pwd_member')->default(false);
            
            // Housing Information
            $table->enum('house_type', ['concrete', 'semi-concrete', 'wood', 'bamboo', 'mixed'])->nullable();
            $table->enum('ownership_status', ['owned', 'rented', 'shared', 'informal-settler'])->nullable();
            
            // Utilities Access
            $table->boolean('has_electricity')->default(false);
            $table->boolean('has_water_supply')->default(false);
            $table->boolean('has_internet_access')->default(false);
            
            // System Fields
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
            
            // Indexes
            $table->index(['barangay']);
            $table->index(['household_type']);
            $table->index(['four_ps_beneficiary']);
            $table->index(['indigent_family']);
            $table->index(['has_senior_citizen']);
            $table->index(['has_pwd_member']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('households');
    }
};
