<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('supporting_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('blotter_id');
            $table->string('url');
            $table->timestamps();

            $table->foreign('blotter_id')->references('id')->on('blotters')->onDelete('cascade');
            $table->index('blotter_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('supporting_documents');
    }
};