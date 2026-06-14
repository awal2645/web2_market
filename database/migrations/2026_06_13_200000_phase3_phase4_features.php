<?php

use App\Support\VehicleListingForeignKey;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('customer_users')) {
            Schema::table('customer_users', function (Blueprint $table) {
                if (! Schema::hasColumn('customer_users', 'slug')) {
                    $table->string('slug')->nullable()->unique()->after('name');
                }

                if (! Schema::hasColumn('customer_users', 'is_dealer')) {
                    $table->boolean('is_dealer')->default(false)->after('is_admin');
                }

                if (! Schema::hasColumn('customer_users', 'email_verified_at')) {
                    $table->timestamp('email_verified_at')->nullable()->after('email');
                }
            });

            if (Schema::hasColumn('customer_users', 'slug')) {
                foreach (DB::table('customer_users')->whereNull('slug')->get() as $user) {
                    $base = Str::slug($user->name ?: 'seller') ?: 'seller';
                    $slug = $base;
                    $counter = 2;

                    while (
                        DB::table('customer_users')
                            ->where('slug', $slug)
                            ->where('id', '!=', $user->id)
                            ->exists()
                    ) {
                        $slug = "{$base}-{$counter}";
                        $counter++;
                    }

                    DB::table('customer_users')
                        ->where('id', $user->id)
                        ->update(['slug' => $slug]);
                }
            }

            if (Schema::hasColumn('customer_users', 'email_verified_at')) {
                DB::table('customer_users')
                    ->whereNull('email_verified_at')
                    ->update(['email_verified_at' => now()]);
            }
        }

        if (Schema::hasTable('vehicle_listings')) {
            Schema::table('vehicle_listings', function (Blueprint $table) {
                if (! Schema::hasColumn('vehicle_listings', 'view_count')) {
                    $table->unsignedInteger('view_count')->default(0)->after('status');
                }
            });
        }

        if (Schema::hasTable('saved_listings')) {
            Schema::table('saved_listings', function (Blueprint $table) {
                if (! Schema::hasColumn('saved_listings', 'saved_price')) {
                    $table->unsignedInteger('saved_price')->nullable()->after('vehicle_listing_id');
                }

                if (! Schema::hasColumn('saved_listings', 'price_alerts_enabled')) {
                    $table->boolean('price_alerts_enabled')->default(true)->after('saved_price');
                }
            });
        }

        if (! Schema::hasTable('listing_reports')) {
            Schema::create('listing_reports', function (Blueprint $table) {
                $table->id();
                VehicleListingForeignKey::addColumn($table, 'vehicle_listing_id');
                $table->string('user_id', 191)->nullable();
                $table->string('reason');
                $table->text('details')->nullable();
                $table->string('status')->default('open');
                $table->timestamps();

                VehicleListingForeignKey::addForeignKey($table, 'vehicle_listing_id', 'cascade');
                $table->foreign('user_id')->references('id')->on('customer_users')->nullOnDelete();
                $table->index(['vehicle_listing_id', 'status']);
            });
        } else {
            VehicleListingForeignKey::ensureForeignKey('listing_reports', 'vehicle_listing_id', false, 'cascade');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('listing_reports');

        if (Schema::hasTable('saved_listings')) {
            Schema::table('saved_listings', function (Blueprint $table) {
                foreach (['price_alerts_enabled', 'saved_price'] as $column) {
                    if (Schema::hasColumn('saved_listings', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }

        if (Schema::hasTable('vehicle_listings') && Schema::hasColumn('vehicle_listings', 'view_count')) {
            Schema::table('vehicle_listings', function (Blueprint $table) {
                $table->dropColumn('view_count');
            });
        }

        if (Schema::hasTable('customer_users')) {
            Schema::table('customer_users', function (Blueprint $table) {
                foreach (['email_verified_at', 'is_dealer', 'slug'] as $column) {
                    if (Schema::hasColumn('customer_users', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
