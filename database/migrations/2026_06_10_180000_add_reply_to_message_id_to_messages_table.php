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
        Schema::table('messages', function (Blueprint $table) {
            if (! Schema::hasColumn('messages', 'reply_to_message_id')) {
                $table->foreignId('reply_to_message_id')
                    ->nullable()
                    ->after('sender_id')
                    ->constrained('messages')
                    ->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reply_to_message_id');
        });
    }
};
