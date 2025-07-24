<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('base_ticket_id');
            $table->enum('c_category', [
                'PUBLIC_SERVICES',
                'INFRASTRUCTURE',
                'SOCIAL_WELFARE',
                'PUBLIC_SAFETY',
                'HEALTH_SERVICES',
                'ENVIRONMENTAL',
                'EDUCATION',
                'BUSINESS_PERMITS',
                'COMMUNITY_PROGRAMS',
                'OTHERS'
            ]);
            $table->enum('department', [
                'ADMINISTRATION',
                'HEALTH_SERVICES',
                'SOCIAL_SERVICES',
                'SECURITY_PUBLIC_SAFETY',
                'FINANCE_TREASURY',
                'RECORDS_MANAGEMENT',
                'COMMUNITY_DEVELOPMENT',
                'DISASTER_RISK_REDUCTION',
                'ENVIRONMENTAL_MANAGEMENT',
                'YOUTH_SPORTS_DEVELOPMENT',
                'SENIOR_CITIZEN_AFFAIRS',
                'WOMENS_AFFAIRS',
                'BUSINESS_PERMITS',
                'INFRASTRUCTURE_DEVELOPMENT'
            ]);
            $table->string('location')->nullable();
            $table->timestamps();

            $table->foreign('base_ticket_id')
                ->references('id')
                ->on('tickets')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table->index('base_ticket_id');
            $table->index('c_category');
            $table->index('department');
        });
    }

    public function down()
    {
        Schema::dropIfExists('complaints');
    }
};