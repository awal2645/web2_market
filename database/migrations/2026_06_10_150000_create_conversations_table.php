<?php

use App\Support\VehicleListingForeignKey;
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
        if (Schema::hasTable('conversations')) {
            VehicleListingForeignKey::ensureForeignKey('conversations', 'vehicle_listing_id', true);

            return;
        }

        Schema::create('conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('participant_one_id', 191);
            $table->string('participant_two_id', 191);
            VehicleListingForeignKey::addColumn($table, 'vehicle_listing_id', true);
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->foreign('participant_one_id')->references('id')->on('customer_users')->cascadeOnDelete();
            $table->foreign('participant_two_id')->references('id')->on('customer_users')->cascadeOnDelete();
            VehicleListingForeignKey::addForeignKey($table, 'vehicle_listing_id');
            $table->index(['participant_one_id', 'participant_two_id']);
            $table->index('last_message_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
