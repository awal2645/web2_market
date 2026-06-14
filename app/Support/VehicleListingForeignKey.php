<?php

namespace App\Support;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\ColumnDefinition;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VehicleListingForeignKey
{
    public static function resolvedColumnType(): string
    {
        if (! Schema::hasTable('vehicle_listings') || ! Schema::hasColumn('vehicle_listings', 'id')) {
            return 'bigint unsigned';
        }

        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return 'integer';
        }

        $row = DB::selectOne(
            'SELECT COLUMN_TYPE AS column_type FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME = ?',
            ['vehicle_listings', 'id'],
        );

        return strtolower((string) ($row->column_type ?? 'bigint unsigned'));
    }

    public static function addColumn(Blueprint $table, string $columnName, bool $nullable = false): void
    {
        $column = self::makeColumn($table, $columnName);

        if ($nullable) {
            $column->nullable();
        }
    }

    public static function addForeignKey(Blueprint $table, string $columnName, string $onDelete = 'set null'): void
    {
        $foreign = $table->foreign($columnName)->references('id')->on('vehicle_listings');

        match ($onDelete) {
            'cascade' => $foreign->cascadeOnDelete(),
            'restrict' => $foreign->restrictOnDelete(),
            default => $foreign->nullOnDelete(),
        };
    }

    public static function ensureForeignKey(
        string $tableName,
        string $columnName,
        bool $nullable,
        string $onDelete = 'set null',
    ): void {
        if (! Schema::hasTable($tableName) || ! Schema::hasTable('vehicle_listings')) {
            return;
        }

        if (! Schema::hasColumn($tableName, $columnName)) {
            Schema::table($tableName, function (Blueprint $table) use ($columnName, $nullable, $onDelete): void {
                self::addColumn($table, $columnName, $nullable);
                self::addForeignKey($table, $columnName, $onDelete);
            });

            return;
        }

        self::alignExistingColumn($tableName, $columnName, $nullable);

        if (self::foreignKeyExists($tableName, $columnName)) {
            return;
        }

        self::removeOrphanedListingReferences($tableName, $columnName, $nullable);

        Schema::table($tableName, function (Blueprint $table) use ($columnName, $onDelete): void {
            self::addForeignKey($table, $columnName, $onDelete);
        });
    }

    public static function removeOrphanedListingReferences(
        string $tableName,
        string $columnName,
        bool $nullable,
    ): void {
        if (! Schema::hasTable($tableName) || ! Schema::hasColumn($tableName, $columnName)) {
            return;
        }

        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        if ($nullable) {
            DB::statement(
                "UPDATE `{$tableName}` AS child
                 LEFT JOIN `vehicle_listings` AS listings ON child.`{$columnName}` = listings.`id`
                 SET child.`{$columnName}` = NULL
                 WHERE child.`{$columnName}` IS NOT NULL
                   AND listings.`id` IS NULL",
            );

            return;
        }

        DB::statement(
            "DELETE child FROM `{$tableName}` AS child
             LEFT JOIN `vehicle_listings` AS listings ON child.`{$columnName}` = listings.`id`
             WHERE child.`{$columnName}` IS NOT NULL
               AND listings.`id` IS NULL",
        );
    }

    public static function alignExistingColumn(string $tableName, string $columnName, bool $nullable): void
    {
        if (! Schema::hasTable($tableName) || ! Schema::hasColumn($tableName, $columnName)) {
            return;
        }

        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        self::dropForeignKeyIfExists($tableName, $columnName);

        $targetType = self::resolvedColumnType();
        $nullSql = $nullable ? 'NULL' : 'NOT NULL';

        DB::statement("ALTER TABLE `{$tableName}` MODIFY `{$columnName}` {$targetType} {$nullSql}");
    }

    public static function dropForeignKeyIfExists(string $tableName, string $columnName): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        $foreignKeys = DB::select(
            'SELECT CONSTRAINT_NAME AS name
             FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME = ?
               AND REFERENCED_TABLE_NAME IS NOT NULL',
            [$tableName, $columnName],
        );

        foreach ($foreignKeys as $foreignKey) {
            DB::statement("ALTER TABLE `{$tableName}` DROP FOREIGN KEY `{$foreignKey->name}`");
        }
    }

    public static function foreignKeyExists(string $tableName, string $columnName): bool
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return false;
        }

        return DB::selectOne(
            'SELECT 1 AS found
             FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME = ?
               AND REFERENCED_TABLE_NAME = ?',
            [$tableName, $columnName, 'vehicle_listings'],
        ) !== null;
    }

    /**
     * @return ColumnDefinition
     */
    private static function makeColumn(Blueprint $table, string $columnName)
    {
        $type = self::resolvedColumnType();

        if (str_contains($type, 'bigint')) {
            return str_contains($type, 'unsigned')
                ? $table->unsignedBigInteger($columnName)
                : $table->bigInteger($columnName);
        }

        if (str_contains($type, 'smallint')) {
            return str_contains($type, 'unsigned')
                ? $table->unsignedSmallInteger($columnName)
                : $table->smallInteger($columnName);
        }

        if (str_contains($type, 'mediumint')) {
            return str_contains($type, 'unsigned')
                ? $table->unsignedMediumInteger($columnName)
                : $table->mediumInteger($columnName);
        }

        return str_contains($type, 'unsigned')
            ? $table->unsignedInteger($columnName)
            : $table->integer($columnName);
    }
}
