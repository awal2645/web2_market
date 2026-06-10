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
        if (Schema::hasTable('messages')) {
            return;
        }

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->uuid('conversation_id');
            $table->string('sender_id', 191);
            $table->text('body');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->foreign('conversation_id')->references('id')->on('conversations')->cascadeOnDelete();
            $table->foreign('sender_id')->references('id')->on('customer_users')->cascadeOnDelete();
            $table->index(['conversation_id', 'created_at']);
            $table->index(['conversation_id', 'read_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
