<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ensure customer_users exists for tests and market-only installs.
     * web2autos-next already creates this table via Prisma on the shared database.
     */
    public function up(): void
    {
        if (Schema::hasTable('customer_users')) {
            return;
        }

        Schema::create('customer_users', function (Blueprint $table) {
            $table->string('id', 191)->primary();
            $table->string('email', 191)->unique();
            $table->string('password_hash', 191);
            $table->string('name', 191)->nullable();
            $table->string('phone', 32)->nullable();
            $table->string('image_url', 2048)->nullable();
            $table->text('address')->nullable();
            $table->string('ghl_contact_id', 64)->nullable();
            $table->boolean('is_admin')->default(false);
            $table->timestamp('listing_prompt_completed_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('customer_users')) {
            return;
        }

        if (Schema::hasTable('vehicle_listings')) {
            Schema::table('vehicle_listings', function (Blueprint $table) {
                if ($this->hasForeignKey('vehicle_listings', 'vehicle_listings_user_id_foreign')) {
                    $table->dropForeign(['user_id']);
                }
            });
        }

        Schema::dropIfExists('customer_users');
    }

    private function hasForeignKey(string $table, string $foreignKey): bool
    {
        $connection = Schema::getConnection();
        $driver = $connection->getDriverName();

        if ($driver === 'sqlite') {
            return false;
        }

        $database = $connection->getDatabaseName();

        $result = $connection->selectOne(
            'SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = ? AND CONSTRAINT_TYPE = ?',
            [$database, $table, $foreignKey, 'FOREIGN KEY'],
        );

        return $result !== null;
    }
};
