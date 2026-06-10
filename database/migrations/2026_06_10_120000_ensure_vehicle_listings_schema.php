<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add missing market columns when vehicle_listings already exists in the shared DB
     * (e.g. after migrate:sync-history without running the original create migration).
     */
    public function up(): void
    {
        if (! Schema::hasTable('vehicle_listings')) {
            return;
        }

        Schema::table('vehicle_listings', function (Blueprint $table) {
            if (! Schema::hasColumn('vehicle_listings', 'user_id')) {
                $table->string('user_id', 191);
            }

            if (! Schema::hasColumn('vehicle_listings', 'year')) {
                $table->unsignedSmallInteger('year')->default(0);
            }

            if (! Schema::hasColumn('vehicle_listings', 'make')) {
                $table->string('make')->default('');
            }

            if (! Schema::hasColumn('vehicle_listings', 'model')) {
                $table->string('model')->default('');
            }

            if (! Schema::hasColumn('vehicle_listings', 'trim')) {
                $table->string('trim')->nullable();
            }

            if (! Schema::hasColumn('vehicle_listings', 'mileage')) {
                $table->unsignedInteger('mileage')->default(0);
            }

            if (! Schema::hasColumn('vehicle_listings', 'vin')) {
                $table->string('vin', 17)->default('');
            }

            if (! Schema::hasColumn('vehicle_listings', 'title_status')) {
                $table->string('title_status')->default('Clean');
            }

            if (! Schema::hasColumn('vehicle_listings', 'condition')) {
                $table->string('condition')->default('Good');
            }

            if (! Schema::hasColumn('vehicle_listings', 'exterior_color')) {
                $table->string('exterior_color')->default('');
            }

            if (! Schema::hasColumn('vehicle_listings', 'interior_color')) {
                $table->string('interior_color')->default('');
            }

            if (! Schema::hasColumn('vehicle_listings', 'transmission')) {
                $table->string('transmission')->default('Automatic');
            }

            if (! Schema::hasColumn('vehicle_listings', 'fuel_type')) {
                $table->string('fuel_type')->default('Gasoline');
            }

            if (! Schema::hasColumn('vehicle_listings', 'drivetrain')) {
                $table->string('drivetrain')->default('FWD');
            }

            if (! Schema::hasColumn('vehicle_listings', 'asking_price')) {
                $table->unsignedInteger('asking_price')->default(0);
            }

            if (! Schema::hasColumn('vehicle_listings', 'seller_notes')) {
                $table->text('seller_notes')->nullable();
            }

            if (! Schema::hasColumn('vehicle_listings', 'contact_name')) {
                $table->string('contact_name')->default('');
            }

            if (! Schema::hasColumn('vehicle_listings', 'contact_email')) {
                $table->string('contact_email')->default('');
            }

            if (! Schema::hasColumn('vehicle_listings', 'contact_phone')) {
                $table->string('contact_phone')->default('');
            }

            if (! Schema::hasColumn('vehicle_listings', 'status')) {
                $table->string('status')->default('pending');
            }

            if (! Schema::hasColumn('vehicle_listings', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }

            if (! Schema::hasColumn('vehicle_listings', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Non-destructive alignment migration; leave shared table columns in place.
    }
};
