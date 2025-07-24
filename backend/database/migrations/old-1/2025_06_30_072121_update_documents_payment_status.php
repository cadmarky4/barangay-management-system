<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update all existing documents to have 'paid' payment status
        // This assumes that all document requests are paid upon submission
        DB::table('documents')
            ->whereIn('payment_status', ['unpaid', 'pending'])
            ->orWhereNull('payment_status')
            ->update(['payment_status' => 'paid']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We can't really reverse this safely since we don't know 
        // what the original payment statuses were
        // So we'll leave this empty
    }
};
