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
        Schema::create('household_members', function (Blueprint $table) {
            $table->id();
            
            // Relationships
            $table->uuid('household_id');
            $table->uuid('resident_id');
            
            // Member relationship to household head
            $table->enum('relationship', [
                'HEAD',
                'SPOUSE',
                'SON',
                'DAUGHTER', 
                'FATHER',
                'MOTHER',
                'BROTHER',
                'SISTER',
                'GRANDFATHER',
                'GRANDMOTHER',
                'GRANDSON',
                'GRANDDAUGHTER',
                'UNCLE',
                'AUNT',
                'NEPHEW',
                'NIECE',
                'COUSIN',
                'IN_LAW',
                'BOARDER',
                'OTHER'
            ])->default('OTHER');
            
            // System fields
            $table->timestamps();
            
            // Foreign Key Constraints
            $table->foreign('household_id')->references('id')->on('households')->onDelete('cascade');
            $table->foreign('resident_id')->references('id')->on('residents')->onDelete('cascade');
            
            // Unique constraint - a resident can only be in one household with one relationship
            $table->unique(['household_id', 'resident_id']);
            
            // Indexes
            $table->index(['household_id']);
            $table->index(['resident_id']);
            $table->index(['relationship']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('household_members');
    }
};