<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('market_settings', function (Blueprint $table) {
            $table->id();
            $table->string('listing_approval_mode')->default('manual');
            $table->timestamps();
        });

        DB::table('market_settings')->insert([
            'listing_approval_mode' => config('market.listing_approval_mode', 'manual'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('market_settings');
    }
};
