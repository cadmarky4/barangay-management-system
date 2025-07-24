<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('other_people_involved', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('blotter_id');
            $table->string('full_name');
            $table->string('address')->nullable();
            $table->string('contact_number', 16);
            $table->enum('involvement', [
                'RESPONDENT',
                'WITNESS',
                'VICTIM',
                'SUSPECT'
            ]);
            $table->timestamps();

            $table->foreign('blotter_id')->references('id')->on('blotters')->onDelete('cascade');
            $table->index('blotter_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('other_people_involved');
    }
};