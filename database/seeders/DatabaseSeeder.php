<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Demo User',
            'email' => 'user@mail.com',
            'email_verified_at' => now(),
            'listing_prompt_completed_at' => now(),
        ]);

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'is_admin' => true,
            'email_verified_at' => now(),
            'listing_prompt_completed_at' => now(),
        ]);

        $this->call(VehicleListingSeeder::class);
    }
}
