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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            
            // General Information
            $table->string('barangay')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('region')->nullable();
            $table->string('type')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('email_address')->nullable();
            $table->string('opening_hours')->nullable();
            $table->string('closing_hours')->nullable();
            $table->string('primary_language')->nullable();
            $table->string('secondary_language')->nullable();
            
            // Privacy and Security
            $table->integer('session_timeout')->default(30);
            $table->integer('max_login_attempts')->default(3);
            $table->integer('data_retention')->default(7);
            $table->string('backup_frequency')->default('Daily');
            
            // System
            $table->string('system_name')->nullable();
            $table->string('version_number')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
