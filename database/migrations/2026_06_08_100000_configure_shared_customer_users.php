<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Align the shared database with web2autos-next so both apps authenticate
     * against customer_users with compatible password hashes.
     */
    public function up(): void
    {
        if (! Schema::hasTable('customer_users')) {
            return;
        }

        Schema::table('customer_users', function (Blueprint $table) {
            if (! Schema::hasColumn('customer_users', 'is_admin')) {
                $table->boolean('is_admin')->default(false);
            }

            if (! Schema::hasColumn('customer_users', 'listing_prompt_completed_at')) {
                $table->timestamp('listing_prompt_completed_at')->nullable();
            }
        });

        $this->alignVehicleListingUserIds();
        $this->alignSessionUserIds();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('customer_users')) {
            return;
        }

        Schema::table('customer_users', function (Blueprint $table) {
            if (Schema::hasColumn('customer_users', 'listing_prompt_completed_at')) {
                $table->dropColumn('listing_prompt_completed_at');
            }

            if (Schema::hasColumn('customer_users', 'is_admin')) {
                $table->dropColumn('is_admin');
            }
        });
    }

    private function alignVehicleListingUserIds(): void
    {
        if (! Schema::hasTable('vehicle_listings') || ! Schema::hasColumn('vehicle_listings', 'user_id')) {
            return;
        }

        $columnType = Schema::getColumnType('vehicle_listings', 'user_id');

        if (in_array($columnType, ['string', 'varchar'], true)) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            $this->recreateVehicleListingsForSqlite();

            return;
        }

        Schema::table('vehicle_listings', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        DB::statement('ALTER TABLE vehicle_listings MODIFY user_id VARCHAR(191) NOT NULL');

        Schema::table('vehicle_listings', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('customer_users')->cascadeOnDelete();
        });
    }

    private function recreateVehicleListingsForSqlite(): void
    {
        Schema::disableForeignKeyConstraints();

        if (Schema::hasTable('vehicle_listing_images')) {
            Schema::drop('vehicle_listing_images');
        }

        Schema::drop('vehicle_listings');

        Schema::create('vehicle_listings', function (Blueprint $table) {
            $table->id();
            $table->string('user_id', 191);
            $table->unsignedSmallInteger('year');
            $table->string('make');
            $table->string('model');
            $table->string('trim')->nullable();
            $table->unsignedInteger('mileage');
            $table->string('vin', 17);
            $table->string('title_status');
            $table->string('condition');
            $table->string('exterior_color');
            $table->string('interior_color');
            $table->string('transmission');
            $table->string('fuel_type');
            $table->string('drivetrain');
            $table->unsignedInteger('asking_price');
            $table->text('seller_notes')->nullable();
            $table->string('contact_name');
            $table->string('contact_email');
            $table->string('contact_phone');
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->foreign('user_id')->references('id')->on('customer_users')->cascadeOnDelete();
        });

        Schema::create('vehicle_listing_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_listing_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    private function alignSessionUserIds(): void
    {
        if (! Schema::hasTable('sessions') || ! Schema::hasColumn('sessions', 'user_id')) {
            return;
        }

        $columnType = Schema::getColumnType('sessions', 'user_id');

        if (in_array($columnType, ['string', 'varchar'], true)) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            return;
        }

        DB::statement('ALTER TABLE sessions MODIFY user_id VARCHAR(191) NULL');
    }
};
