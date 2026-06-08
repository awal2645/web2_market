<?php

namespace Database\Seeders;

use App\Enums\ListingStatus;
use App\Models\User;
use App\Models\VehicleListing;
use App\Models\VehicleListingImage;
use Illuminate\Database\Seeder;

class CarsComListingSeeder extends Seeder
{
    /**
     * Inventory sourced from Cars.com — Signature Auto Sales & Rentals, Fremont, CA.
     *
     * @var list<array<string, mixed>>
     */
    private array $listings = [
        [
            'year' => 2023,
            'make' => 'Volkswagen',
            'model' => 'Jetta',
            'trim' => '1.5T SE',
            'mileage' => 31465,
            'vin' => '3VWEM7BU1PM010091',
            'asking_price' => 19995,
            'image' => 'https://imagescf.dealercenter.net/640/480/202509-a86bf262dc2d46de930edc3881a8e734.jpg',
            'source_url' => 'https://www.cars.com/car/ca/fremont/2023-volkswagen-jetta-15tse/99f625bf-7730-4604-95d2-08ddf29497ac',
        ],
        [
            'year' => 2021,
            'make' => 'Volkswagen',
            'model' => 'Atlas',
            'trim' => 'SEL R-LINE 4MOTION',
            'mileage' => 43806,
            'vin' => '1V2SR2CA8MC538835',
            'asking_price' => 29995,
            'drivetrain' => 'AWD',
            'image' => 'https://imagescf.dealercenter.net/640/480/202604-bd8be0baac0e4d5487636493ca49ab2a.jpg',
            'source_url' => 'https://www.cars.com/car/ca/fremont/2021-volkswagen-atlas-selrline4motion/58bfdf6c-7741-46a1-bee2-08de99fbe21d',
        ],
        [
            'year' => 2019,
            'make' => 'Tesla',
            'model' => 'Model 3',
            'trim' => 'Standard Range Plus',
            'mileage' => 66033,
            'vin' => '5YJ3E1EAXKF412095',
            'asking_price' => 20995,
            'fuel_type' => 'Electric',
            'drivetrain' => 'RWD',
            'image' => 'https://imagescf.dealercenter.net/640/480/202602-99c17776743a4f86b951e156e72357a7.jpg',
            'source_url' => 'https://www.cars.com/car/ca/fremont/2019-tesla-model-3-standardrangeplus/1999d2c1-dc44-41c2-d4d1-08de6ec019f4',
        ],
        [
            'year' => 2020,
            'make' => 'Ford',
            'model' => 'Explorer',
            'trim' => 'Limited',
            'mileage' => 89202,
            'vin' => '1FMSK7FH7LGC00339',
            'asking_price' => 21995,
            'drivetrain' => 'AWD',
            'image' => 'https://imagescf.dealercenter.net/640/480/202606-c0012f02ebf74eaba2ae4aff683d4a20.jpg',
            'source_url' => 'https://www.cars.com/car/ca/fremont/2020-ford-explorer-limited/307bf4df-7ea7-4926-dc6b-08dec2e7b6db',
        ],
        [
            'year' => 2020,
            'make' => 'Kia',
            'model' => 'Sorento',
            'trim' => 'LX',
            'mileage' => 81640,
            'vin' => '5XYPG4A56LG610446',
            'asking_price' => 15995,
            'image' => 'https://imagescf.dealercenter.net/640/480/202602-185bc657cdcc4110a036ddea26e47d3a.jpg',
            'source_url' => 'https://www.cars.com/car/ca/fremont/2020-kia-sorento-lx/59178fab-d7f4-4756-9159-08de6ec03c80',
        ],
        [
            'year' => 2022,
            'make' => 'Volkswagen',
            'model' => 'Tiguan',
            'trim' => 'SE R-LINE BLACK',
            'mileage' => 61203,
            'vin' => '3VVCB7AX4NM142658',
            'asking_price' => 21995,
            'image' => 'https://imagescf.dealercenter.net/640/480/202602-ec5cf84bbfb84d4db9a2901173fb239b.jpg',
            'source_url' => 'https://www.cars.com/car/ca/fremont/2022-volkswagen-tiguan-serlineblack/70edb300-c59f-4a3f-9153-08de6ec03c80',
        ],
        [
            'year' => 2024,
            'make' => 'Chevrolet',
            'model' => 'Malibu',
            'trim' => '1LT',
            'mileage' => 33498,
            'vin' => '1G1ZD5ST1RF223277',
            'asking_price' => 18995,
            'image' => 'https://imagescf.dealercenter.net/640/480/202511-edc221f049fe4d169d414c914c006a8d.jpg',
            'source_url' => 'https://www.cars.com/car/ca/fremont/2024-chevrolet-malibu-1lt/d20d31ba-44ed-41ce-1d55-08de2a62fa34',
        ],
        [
            'year' => 2018,
            'make' => 'Volkswagen',
            'model' => 'Passat',
            'trim' => '2.0T S',
            'mileage' => 85159,
            'vin' => '1VWAA7A30JC025061',
            'asking_price' => 10995,
            'image' => 'https://imagescf.dealercenter.net/640/480/202512-cb9a037307e34ae2a30139c4e6b28065.jpg',
            'source_url' => 'https://www.cars.com/car/ca/fremont/2018-volkswagen-passat-20ts/09229ad5-86ac-4d6f-f6a7-08de2a643cc8',
        ],
        [
            'year' => 2024,
            'make' => 'Chevrolet',
            'model' => 'Equinox',
            'trim' => 'LT',
            'mileage' => 62535,
            'vin' => '3GNAXJEG7RL152196',
            'asking_price' => 18500,
            'drivetrain' => 'AWD',
            'image' => 'https://imagescf.dealercenter.net/640/480/202605-c97f768017a043a98c8e8e6abb9b93cc.jpg',
            'source_url' => 'https://www.cars.com/car/ca/fremont/2024-chevrolet-equinox-lt/b0c151f3-2599-419f-7fb6-08deb1910f65',
        ],
        [
            'year' => 2016,
            'make' => 'Land Rover',
            'model' => 'LR4',
            'trim' => 'HSE',
            'mileage' => 106009,
            'vin' => 'SALAG2V63GA802502',
            'asking_price' => 13500,
            'drivetrain' => '4WD',
            'image' => 'https://imagescf.dealercenter.net/640/480/202605-3d02db4550d1410faf97c55ac95b8786.jpg',
            'source_url' => 'https://www.cars.com/car/ca/fremont/2016-land-rover-lr4-hse/731ee153-3e8d-47b3-c775-08deacd6d552',
        ],
    ];

    public function run(): void
    {
        User::query()
            ->where('email', 'signature-auto@example.com')
            ->update(['email' => 'info@web2auto.com']);

        $seller = User::query()->updateOrCreate(
            ['email' => 'info@web2auto.com'],
            [
                'name' => 'Dat Tran',
                'password' => bcrypt('password'),
                'listing_prompt_completed_at' => now(),
            ],
        );

        foreach ($this->listings as $data) {
            $imageUrl = $data['image'];
            $sourceUrl = $data['source_url'];
            unset($data['image'], $data['source_url']);

            $listing = VehicleListing::query()->updateOrCreate(
                ['vin' => $data['vin']],
                [
                    ...$this->defaults($data),
                    'user_id' => $seller->id,
                    'contact_name' => 'Dat Tran',
                    'contact_email' => $seller->email,
                    'contact_phone' => '408-646-1313',
                    'seller_notes' => "Used inventory from Fremont, CA. Source listing: {$sourceUrl}",
                    'status' => ListingStatus::Approved,
                ],
            );

            if ($listing->images()->exists()) {
                continue;
            }

            VehicleListingImage::query()->create([
                'vehicle_listing_id' => $listing->id,
                'path' => $imageUrl,
                'sort_order' => 0,
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function defaults(array $data): array
    {
        return array_merge([
            'title_status' => 'Clean',
            'condition' => 'Good',
            'exterior_color' => 'Not specified',
            'interior_color' => 'Not specified',
            'transmission' => 'Automatic',
            'fuel_type' => 'Gasoline',
            'drivetrain' => 'FWD',
        ], $data);
    }
}
