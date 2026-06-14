<?php

use App\Support\VehicleListingForeignKey;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Repair vehicle_listing_id foreign keys on shared Next.js databases where
     * vehicle_listings.id is INT rather than Laravel's default BIGINT UNSIGNED.
     */
    public function up(): void
    {
        VehicleListingForeignKey::ensureForeignKey('conversations', 'vehicle_listing_id', true);
        VehicleListingForeignKey::ensureForeignKey('seller_reviews', 'vehicle_listing_id', true);
        VehicleListingForeignKey::ensureForeignKey('saved_listings', 'vehicle_listing_id', false, 'cascade');
        VehicleListingForeignKey::ensureForeignKey('listing_reports', 'vehicle_listing_id', false, 'cascade');
        VehicleListingForeignKey::ensureForeignKey('vehicle_listing_images', 'vehicle_listing_id', false, 'cascade');
    }

    public function down(): void
    {
        // Non-destructive alignment migration.
    }
};
