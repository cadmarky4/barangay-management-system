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
            $table->uuid('id')->primary();
            
            // Household Identification
            $table->string('household_number', 50)->unique()->nullable();
            $table->enum('household_type', ['NUCLEAR', 'EXTENDED', 'SINGLE', 'SINGLE_PARENT', 'OTHER'])->default('NUCLEAR');
            $table->uuid('head_resident_id')->nullable();
            
            // Address Information
            $table->string('house_number', 50);
            $table->string('street_sitio', 100);
            $table->string('barangay', 100);
            $table->text('complete_address');
            
            // Socioeconomic Information
            $table->enum('monthly_income', [
                'BELOW_10000', 
                'RANGE_10000_25000', 
                'RANGE_25000_50000', 
                'RANGE_50000_100000', 
                'ABOVE_100000'
            ])->nullable();
            $table->string('primary_income_source', 255)->nullable();
            
            // Household Classification
            $table->boolean('four_ps_beneficiary')->default(false);
            $table->boolean('indigent_family')->default(false);
            $table->boolean('has_senior_citizen')->default(false);
            $table->boolean('has_pwd_member')->default(false);
            
            // Housing Information
            $table->enum('house_type', ['CONCRETE', 'SEMI_CONCRETE', 'WOOD', 'BAMBOO', 'MIXED'])->nullable();
            $table->enum('ownership_status', ['OWNED', 'RENTED', 'SHARED', 'INFORMAL_SETTLER'])->nullable();
            
            // Utilities Access
            $table->boolean('has_electricity')->default(false);
            $table->boolean('has_water_supply')->default(false);
            $table->boolean('has_internet_access')->default(false);
            
            // Status
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'TRANSFERRED'])->default('ACTIVE');
            
            // Additional Information
            $table->text('remarks')->nullable();
            
            // System Fields
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            
            // Foreign Key Constraints
            $table->foreign('head_resident_id')->references('id')->on('residents')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index(['barangay']);
            $table->index(['household_type']);
            $table->index(['monthly_income']);
            $table->index(['house_type']);
            $table->index(['ownership_status']);
            $table->index(['status']);
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