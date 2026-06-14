<?php

use App\Support\VehicleListingForeignKey;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('seller_reviews')) {
            VehicleListingForeignKey::ensureForeignKey('seller_reviews', 'vehicle_listing_id', true);

            return;
        }

        Schema::create('seller_reviews', function (Blueprint $table) {
            $table->id();
            $table->string('seller_id', 191);
            $table->string('reviewer_id', 191);
            VehicleListingForeignKey::addColumn($table, 'vehicle_listing_id', true);
            $table->unsignedTinyInteger('rating');
            $table->text('body')->nullable();
            $table->timestamps();

            $table->foreign('seller_id')->references('id')->on('customer_users')->cascadeOnDelete();
            $table->foreign('reviewer_id')->references('id')->on('customer_users')->cascadeOnDelete();
            VehicleListingForeignKey::addForeignKey($table, 'vehicle_listing_id');
            $table->unique(['seller_id', 'reviewer_id']);
            $table->index(['seller_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_reviews');
    }
};
