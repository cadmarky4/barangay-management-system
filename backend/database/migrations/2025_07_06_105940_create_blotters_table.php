<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('blotters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('base_ticket_id');
            $table->enum('type_of_incident', [
                'THEFT',
                'PHYSICAL_ASSAULT',
                'VERBAL_ASSAULT',
                'PROPERTY_DAMAGE',
                'DISTURBANCE',
                'TRESPASSING',
                'FRAUD',
                'HARASSMENT',
                'DOMESTIC_DISPUTE',
                'NOISE_COMPLAINT',
                'OTHER'
            ]);
            $table->date('date_of_incident');
            $table->enum('time_of_incident', [
                '08:00',
                '09:00',
                '10:00',
                '11:00',
                '13:00',
                '14:00',
                '15:00',
                '16:00',
                '17:00'
            ]);
            $table->string('location_of_incident');
            $table->timestamps();

            $table->foreign('base_ticket_id')
                ->references('id')
                ->on('tickets')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table->index('base_ticket_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('blotters');
    }
};