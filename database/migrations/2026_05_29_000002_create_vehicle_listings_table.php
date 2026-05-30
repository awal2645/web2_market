<?php

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
        Schema::create('vehicle_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
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
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_listings');
    }
};
