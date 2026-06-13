<?php

use App\Models\VehicleListing;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('vehicle_listings')) {
            return;
        }

        if (! Schema::hasColumn('vehicle_listings', 'slug')) {
            Schema::table('vehicle_listings', function (Blueprint $table) {
                $table->string('slug')->nullable()->after('user_id');
            });
        }

        VehicleListing::query()
            ->where(function ($query): void {
                $query->whereNull('slug')->orWhere('slug', '');
            })
            ->each(function (VehicleListing $listing): void {
                $listing->slug = VehicleListing::generateUniqueSlug($listing);
                $listing->saveQuietly();
            });

        Schema::table('vehicle_listings', function (Blueprint $table) {
            if (
                Schema::hasColumn('vehicle_listings', 'slug')
                && ! $this->hasSlugIndex()
            ) {
                $table->unique('slug');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('vehicle_listings') || ! Schema::hasColumn('vehicle_listings', 'slug')) {
            return;
        }

        Schema::table('vehicle_listings', function (Blueprint $table) {
            if ($this->hasSlugIndex()) {
                $table->dropUnique(['slug']);
            }

            $table->dropColumn('slug');
        });
    }

    private function hasSlugIndex(): bool
    {
        $connection = Schema::getConnection();
        $table = $connection->getTablePrefix().'vehicle_listings';
        $indexes = $connection->getSchemaBuilder()->getIndexes($table);

        foreach ($indexes as $index) {
            if (in_array('slug', $index['columns'], true) && $index['unique']) {
                return true;
            }
        }

        return false;
    }
};
