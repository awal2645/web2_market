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

        User::factory()->create([
            'name' => 'Demo User',
            'email' => 'user@mail.com',
            'listing_prompt_completed_at' => now(),
        ]);

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'is_admin' => true,
            'listing_prompt_completed_at' => now(),
        ]);

        $this->call([
            VehicleListingSeeder::class,
            CarsComListingSeeder::class,
        ]);
    }
}
