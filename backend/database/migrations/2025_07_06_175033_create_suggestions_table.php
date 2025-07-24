// database/migrations/xxxx_xx_xx_create_suggestions_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('suggestions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('base_ticket_id');
            $table->enum('s_category', [
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
            $table->text('expected_benefits')->nullable();
            $table->text('implementation_ideas')->nullable();
            $table->text('resources_needed')->nullable();
            $table->timestamps();

            $table->foreign('base_ticket_id')
                ->references('id')
                ->on('tickets')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table->index('base_ticket_id');
            $table->index('s_category');
        });
    }

    public function down()
    {
        Schema::dropIfExists('suggestions');
    }
};