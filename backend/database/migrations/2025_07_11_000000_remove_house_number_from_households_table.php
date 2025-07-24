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
        Schema::table('households', function (Blueprint $table) {
            // Drop indexes first before dropping columns
            try {
                $table->dropIndex(['barangay']);
            } catch (Exception $e) {
                // Index may not exist, continue
            }
            
            // Check if the column exists before trying to drop it
            if (Schema::hasColumn('households', 'house_number')) {
                $table->dropColumn('house_number');
            }
            
            // Also remove street_sitio and barangay if they exist
            // as they are not in the current schema
            if (Schema::hasColumn('households', 'street_sitio')) {
                $table->dropColumn('street_sitio');
            }
            
            if (Schema::hasColumn('households', 'barangay')) {
                $table->dropColumn('barangay');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('households', function (Blueprint $table) {
            // Add the columns back if needed
            $table->string('house_number', 50)->nullable();
            $table->string('street_sitio', 100)->nullable();
            $table->string('barangay', 100)->nullable();
            
            // Recreate the index
            $table->index(['barangay']);
        });
    }
};
