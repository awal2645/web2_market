<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\VehicleListing;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VehicleListing>
 */
class VehicleListingFactory extends Factory
{
    protected $model = VehicleListing::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'year' => fake()->numberBetween(2015, 2024),
            'make' => fake()->randomElement(['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW']),
            'model' => fake()->word(),
            'trim' => fake()->optional()->word(),
            'mileage' => fake()->numberBetween(1000, 150000),
            'vin' => strtoupper(fake()->bothify('?#?#?#?#?#?#?#?#?#?#?#?#?#?#')),
            'title_status' => 'Clean',
            'condition' => 'Good',
            'exterior_color' => fake()->safeColorName(),
            'interior_color' => fake()->safeColorName(),
            'transmission' => 'Automatic',
            'fuel_type' => 'Gasoline',
            'drivetrain' => 'FWD',
            'asking_price' => fake()->numberBetween(5000, 45000),
            'seller_notes' => fake()->optional()->sentence(),
            'contact_name' => fake()->name(),
            'contact_email' => fake()->safeEmail(),
            'contact_phone' => fake()->phoneNumber(),
            'status' => 'pending',
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => ['status' => 'approved']);
    }
}
