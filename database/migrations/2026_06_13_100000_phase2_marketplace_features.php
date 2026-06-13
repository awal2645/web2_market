<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('vehicle_listings')) {
            Schema::table('vehicle_listings', function (Blueprint $table) {
                if (! Schema::hasColumn('vehicle_listings', 'city')) {
                    $table->string('city')->nullable()->after('drivetrain');
                }

                if (! Schema::hasColumn('vehicle_listings', 'state')) {
                    $table->string('state', 2)->nullable()->after('city');
                }

                if (! Schema::hasColumn('vehicle_listings', 'zip_code')) {
                    $table->string('zip_code', 10)->nullable()->after('state');
                }

                if (! Schema::hasColumn('vehicle_listings', 'body_type')) {
                    $table->string('body_type')->nullable()->after('zip_code');
                }
            });
        }

        if (! Schema::hasTable('saved_listings')) {
            Schema::create('saved_listings', function (Blueprint $table) {
                $table->id();
                $table->string('user_id', 191);
                $table->foreignId('vehicle_listing_id')->constrained('vehicle_listings')->cascadeOnDelete();
                $table->timestamps();

                $table->unique(['user_id', 'vehicle_listing_id']);
                $table->index('user_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_listings');

        if (Schema::hasTable('vehicle_listings')) {
            Schema::table('vehicle_listings', function (Blueprint $table) {
                foreach (['body_type', 'zip_code', 'state', 'city'] as $column) {
                    if (Schema::hasColumn('vehicle_listings', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
