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
            $table->time('opening_hours')->nullable();
            $table->time('closing_hours')->nullable();
            $table->string('primary_language')->default('English');
            $table->string('secondary_language')->nullable();
            
            // Privacy and Security
            $table->integer('session_timeout')->default(30); // minutes
            $table->integer('max_login_attempts')->default(3);
            $table->integer('data_retention')->default(7); // years
            $table->enum('backup_frequency', ['Daily', 'Weekly', 'Monthly'])->default('Daily');
            
            // System
            $table->string('system_name')->default('Barangay West Triangle');
            $table->string('version_number')->default('1.0.0');
            
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
