<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class SyncMigrationHistory extends Command
{
    protected $signature = 'migrate:sync-history
                            {--force : Run without confirmation on production}';

    protected $description = 'Mark on-disk migrations as already run (shared DB where tables exist)';

    public function handle(): int
    {
        if (! $this->option('force') && ! $this->confirm(
            'Mark all local migration files as run without executing them?',
            true,
        )) {
            return self::FAILURE;
        }

        $table = config('database.migrations.table', 'laravel_migrations');

        if (! Schema::hasTable($table)) {
            $this->call('migrate:install');
        }

        $migrationNames = collect(File::files(database_path('migrations')))
            ->map(fn ($file) => pathinfo($file->getFilename(), PATHINFO_FILENAME))
            ->sort()
            ->values();

        if ($migrationNames->isEmpty()) {
            $this->warn('No migration files found.');

            return self::SUCCESS;
        }

        $existing = DB::table($table)->pluck('migration');
        $missing = $migrationNames->diff($existing);

        if ($missing->isEmpty()) {
            $this->info("All {$migrationNames->count()} migrations are already recorded in `{$table}`.");

            return self::SUCCESS;
        }

        $batch = (int) DB::table($table)->max('batch') + 1;

        DB::table($table)->insert(
            $missing->map(fn (string $migration) => [
                'migration' => $migration,
                'batch' => $batch,
            ])->all(),
        );

        $this->info("Recorded {$missing->count()} migration(s) in `{$table}` (batch {$batch}).");
        $this->line('Run `php artisan migrate` to apply any newer migrations only.');

        return self::SUCCESS;
    }
}
