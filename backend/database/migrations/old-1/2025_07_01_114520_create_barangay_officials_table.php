<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barangay_officials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('resident_id');
            $table->foreign('resident_id')->references('id')->on('residents');
            
            // Prefix
            $table->enum('prefix', ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Hon.']);
            
            // Position Information
            $table->enum('position', [
                'BARANGAY_CAPTAIN', 'BARANGAY_SECRETARY', 'BARANGAY_TREASURER', 
                'KAGAWAD', 'SK_CHAIRPERSON', 'SK_KAGAWAD', 'BARANGAY_CLERK', 'BARANGAY_TANOD'
            ]);
            
            // Committee Information
            $table->enum('committee_assignment', [
                'Health', 'Education', 'Public Safety', 'Environment', 
                'Peace and Order', 'Sports and Recreation', 'Women and Family', 'Senior Citizens'
            ]);
            
            // Term Information
            $table->date('term_start');
            $table->date('term_end');
            $table->integer('term_number')->nullable();
            $table->boolean('is_current_term')->default(true);
            
            // Status
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED', 'DECEASED'])
                  ->default('ACTIVE');
            
            $table->timestamps();

            // Indexes
            $table->index('position');
            $table->index('status');
            $table->index(['term_start', 'term_end']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barangay_officials');
    }
};
