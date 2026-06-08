<?php

namespace Database\Seeders;

use App\Enums\ListingStatus;
use App\Models\User;
use App\Models\VehicleListing;
use App\Models\VehicleListingImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class VehicleListingSeeder extends Seeder
{
    /**
     * @var list<array<string, mixed>>
     */
    private array $listings = [
        [
            'year' => 2022,
            'make' => 'BMW',
            'model' => 'M4',
            'trim' => 'Competition',
            'mileage' => 18400,
            'vin' => 'WBSGV9C05NCH12345',
            'title_status' => 'Clean',
            'condition' => 'Excellent',
            'exterior_color' => 'Brooklyn Grey',
            'interior_color' => 'Black',
            'transmission' => 'Automatic',
            'fuel_type' => 'Gasoline',
            'drivetrain' => 'RWD',
            'asking_price' => 68900,
            'seller_notes' => 'Garage kept, full service history, carbon exterior package. One owner, no accidents.',
            'image' => 'car-1.jpg',
        ],
        [
            'year' => 2021,
            'make' => 'Porsche',
            'model' => '911',
            'trim' => 'Carrera S',
            'mileage' => 22100,
            'vin' => 'WP0AB2A91MS123456',
            'title_status' => 'Clean',
            'condition' => 'Excellent',
            'exterior_color' => 'White',
            'interior_color' => 'Red',
            'transmission' => 'Automatic',
            'fuel_type' => 'Gasoline',
            'drivetrain' => 'RWD',
            'asking_price' => 124500,
            'seller_notes' => 'Sport Chrono, premium audio, PASM suspension. Immaculate inside and out.',
            'image' => 'car-2.jpg',
        ],
        [
            'year' => 2023,
            'make' => 'Chevrolet',
            'model' => 'Corvette',
            'trim' => 'Stingray 3LT',
            'mileage' => 8900,
            'vin' => '1G1YF2D30P5123456',
            'title_status' => 'Clean',
            'condition' => 'Excellent',
            'exterior_color' => 'Torch Red',
            'interior_color' => 'Jet Black',
            'transmission' => 'Automatic',
            'fuel_type' => 'Gasoline',
            'drivetrain' => 'RWD',
            'asking_price' => 78900,
            'seller_notes' => 'Z51 performance package, front lift, transparent roof panel. Like new condition.',
            'image' => 'car-3.jpg',
        ],
        [
            'year' => 2020,
            'make' => 'Mercedes-Benz',
            'model' => 'C-Class',
            'trim' => 'AMG C43',
            'mileage' => 35600,
            'vin' => 'WDDWJ4KB0LF123456',
            'title_status' => 'Clean',
            'condition' => 'Good',
            'exterior_color' => 'Black',
            'interior_color' => 'Tan',
            'transmission' => 'Automatic',
            'fuel_type' => 'Gasoline',
            'drivetrain' => 'AWD',
            'asking_price' => 42900,
            'seller_notes' => 'AMG styling, panoramic roof, blind spot assist. Well maintained with recent brakes and tires.',
            'image' => 'car-4.jpg',
        ],
        [
            'year' => 2022,
            'make' => 'Audi',
            'model' => 'RS5',
            'trim' => 'Sportback',
            'mileage' => 14200,
            'vin' => 'WUAZZZF51NN123456',
            'title_status' => 'Clean',
            'condition' => 'Excellent',
            'exterior_color' => 'Nardo Grey',
            'interior_color' => 'Black',
            'transmission' => 'Automatic',
            'fuel_type' => 'Gasoline',
            'drivetrain' => 'AWD',
            'asking_price' => 79900,
            'seller_notes' => 'Dynamic package, B&O sound, carbon optics. Still under factory warranty.',
            'image' => 'car-5.jpg',
        ],
        [
            'year' => 2021,
            'make' => 'Mercedes-Benz',
            'model' => 'GLE',
            'trim' => '450 4MATIC',
            'mileage' => 29800,
            'vin' => '4JGFB4KB1MA123456',
            'title_status' => 'Clean',
            'condition' => 'Good',
            'exterior_color' => 'Polar White',
            'interior_color' => 'Macchiato Beige',
            'transmission' => 'Automatic',
            'fuel_type' => 'Gasoline',
            'drivetrain' => 'AWD',
            'asking_price' => 54900,
            'seller_notes' => 'Third row seating, premium package, 360 camera. Perfect family SUV with luxury feel.',
            'image' => 'car-6.jpg',
        ],
    ];

    public function run(): void
    {
        $seller = User::firstOrCreate(
            ['email' => 'seller@example.com'],
            [
                'name' => 'Demo Seller',
                'password' => 'password',
                'listing_prompt_completed_at' => now(),
            ],
        );

        foreach ($this->listings as $index => $data) {
            $imageFile = $data['image'];
            unset($data['image']);

            $listing = VehicleListing::query()->updateOrCreate(
                ['vin' => $data['vin']],
                [
                    ...$data,
                    'user_id' => $seller->id,
                    'contact_name' => $seller->name,
                    'contact_email' => $seller->email,
                    'contact_phone' => '(555) 010-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                    'status' => ListingStatus::Approved,
                ],
            );

            if ($listing->images()->exists()) {
                continue;
            }

            $source = public_path("images/demo-vehicles/{$imageFile}");

            if (! File::exists($source)) {
                continue;
            }

            $storagePath = "vehicle-listings/{$imageFile}";
            Storage::disk('public')->put($storagePath, File::get($source));

            VehicleListingImage::query()->create([
                'vehicle_listing_id' => $listing->id,
                'path' => $storagePath,
                'sort_order' => 0,
            ]);
        }
    }
}
