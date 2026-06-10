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
        Schema::table('conversations', function (Blueprint $table) {
            if (! Schema::hasColumn('conversations', 'participant_one_hidden_at')) {
                $table->timestamp('participant_one_hidden_at')->nullable()->after('last_message_at');
            }

            if (! Schema::hasColumn('conversations', 'participant_two_hidden_at')) {
                $table->timestamp('participant_two_hidden_at')->nullable()->after('participant_one_hidden_at');
            }
        });

        Schema::table('messages', function (Blueprint $table) {
            if (! Schema::hasColumn('messages', 'deleted_at')) {
                $table->timestamp('deleted_at')->nullable()->after('read_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropColumn(['participant_one_hidden_at', 'participant_two_hidden_at']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn('deleted_at');
        });
    }
};
