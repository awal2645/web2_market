<?php

use App\Support\VehicleListingForeignKey;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Align vehicle_listing_images for shared DB deploys where the table exists
     * without Laravel's expected columns.
     */
    public function up(): void
    {
        if (! Schema::hasTable('vehicle_listing_images')) {
            Schema::create('vehicle_listing_images', function (Blueprint $table) {
                $table->id();
                VehicleListingForeignKey::addColumn($table, 'vehicle_listing_id');
                $table->string('path');
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();

                VehicleListingForeignKey::addForeignKey($table, 'vehicle_listing_id', 'cascade');
            });

            return;
        }

        Schema::table('vehicle_listing_images', function (Blueprint $table) {
            if (! Schema::hasColumn('vehicle_listing_images', 'vehicle_listing_id')) {
                VehicleListingForeignKey::addColumn($table, 'vehicle_listing_id');
            }

            if (! Schema::hasColumn('vehicle_listing_images', 'path')) {
                $table->string('path')->default('');
            }

            if (! Schema::hasColumn('vehicle_listing_images', 'sort_order')) {
                $table->unsignedSmallInteger('sort_order')->default(0);
            }

            if (! Schema::hasColumn('vehicle_listing_images', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }

            if (! Schema::hasColumn('vehicle_listing_images', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });

        VehicleListingForeignKey::ensureForeignKey('vehicle_listing_images', 'vehicle_listing_id', false, 'cascade');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Non-destructive alignment migration; leave shared table columns in place.
    }
};
