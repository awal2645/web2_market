<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::updateOrCreate(
            ['email' => 'user@mail.com'],
            [
                'name' => 'Demo User',
                'password' => 'password',
                'listing_prompt_completed_at' => now(),
            ],
        );

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'is_admin' => true,
                'password' => 'password',
                'listing_prompt_completed_at' => now(),
            ],
        );

        $this->call([
            VehicleListingSeeder::class,
            CarsComListingSeeder::class,
        ]);
    }
}
