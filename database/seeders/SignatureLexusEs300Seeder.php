<?php

namespace Database\Seeders;

use App\Enums\ListingStatus;
use App\Models\User;
use App\Models\VehicleListing;
use App\Models\VehicleListingImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class SignatureLexusEs300Seeder extends Seeder
{
    /** Stable marker so re-seeding updates this listing instead of duplicating. */
    private const SEED_MARKER = '[seed:signature-2002-lexus-es300]';

    private const CONTACT_EMAIL = 'info@web2auto.com';

    private const CONTACT_NAME = 'Signature Auto Sales & Rentals';

    private const CONTACT_PHONE = '(844) 922-7227';

    private const STORAGE_DIR = 'vehicle-listings/2002-lexus-es300';

    private const SELLER_NOTES = <<<'NOTES'
[seed:signature-2002-lexus-es300]
2002 Lexus ES 300 Sedan 4D – 3.0L V6 Automatic

Black exterior
Beige leather interior
3.0L V6 VVT-i engine
210 horsepower
5-speed automatic transmission
Front-wheel drive
5-passenger seating
Power seats
Automatic climate control
Wood-grain trim
Factory CD/cassette stereo
Alloy wheels
Tinted windows
Fog lights

Dealer: Signature Autos & Sales
Asking price: $6,995
Mileage: confirm with dealer
NOTES;

    public function run(): void
    {
        $seller = User::updateOrCreate(
            ['email' => self::CONTACT_EMAIL],
            [
                'name' => 'Dat Tran',
                'password' => 'password',
                'listing_prompt_completed_at' => now(),
            ],
        );

        $images = $this->copySeedImages();

        // Match by seed marker only so older/orphan copies (e.g. from shared DB) get replaced.
        $listing = VehicleListing::query()
            ->where('seller_notes', 'like', '%'.self::SEED_MARKER.'%')
            ->orderBy('id')
            ->first();

        VehicleListing::query()
            ->where('seller_notes', 'like', '%'.self::SEED_MARKER.'%')
            ->when($listing, fn ($q) => $q->where('id', '!=', $listing->id))
            ->each(function (VehicleListing $extra): void {
                $extra->images()->delete();
                $extra->delete();
            });

        $data = [
            'user_id' => $seller->id,
            'year' => 2002,
            'make' => 'Lexus',
            'model' => 'ES 300',
            'trim' => 'Sedan 4D',
            'mileage' => 0,
            'vin' => '',
            'title_status' => 'Clean',
            'condition' => 'Good',
            'exterior_color' => 'Black',
            'interior_color' => 'Beige',
            'transmission' => 'Automatic',
            'fuel_type' => 'Gasoline',
            'drivetrain' => 'FWD',
            'asking_price' => 6995,
            'seller_notes' => self::SELLER_NOTES,
            'contact_name' => self::CONTACT_NAME,
            'contact_email' => self::CONTACT_EMAIL,
            'contact_phone' => self::CONTACT_PHONE,
            'status' => ListingStatus::Approved,
        ];

        if ($listing) {
            $listing->images()->delete();
            $listing->update($data);
        } else {
            $listing = VehicleListing::query()->create($data);
        }

        foreach ($images as $index => $path) {
            VehicleListingImage::query()->create([
                'vehicle_listing_id' => $listing->id,
                'path' => $path,
                'sort_order' => $index,
            ]);
        }

        $this->command?->info(
            "Seeded Signature Auto 2002 Lexus ES 300 (#{$listing->id}, \$6995, ".count($images).' photos)',
        );
    }

    /**
     * Copy real photos from seed-assets (preferred) or local public mirror.
     *
     * @return list<string>
     */
    private function copySeedImages(): array
    {
        $seedDir = $this->resolveSeedDir();

        $files = collect(File::files($seedDir))
            ->filter(fn ($file) => (bool) preg_match('/\.(png|jpe?g|webp)$/i', $file->getFilename()))
            ->sortBy(fn ($file) => $file->getFilename())
            ->values();

        if ($files->isEmpty()) {
            throw new \RuntimeException("No seed photos found in {$seedDir}");
        }

        // Keep a local mirror for the market repo (not the dummy car-*.jpg demos).
        $publicMirror = public_path('images/demo-vehicles/2002-lexus-es300');
        File::ensureDirectoryExists($publicMirror);

        Storage::disk('public')->deleteDirectory(self::STORAGE_DIR);
        Storage::disk('public')->makeDirectory(self::STORAGE_DIR);

        // Next.js serves /market-storage from this folder (checked before market storage).
        $nextMarketPublic = base_path('../web2autos-next/storage/market-public/'.self::STORAGE_DIR);
        File::ensureDirectoryExists($nextMarketPublic);
        File::cleanDirectory($nextMarketPublic);

        $saved = [];

        foreach ($files as $file) {
            $filename = $file->getFilename();
            $contents = File::get($file->getPathname());

            File::put("{$publicMirror}/{$filename}", $contents);
            File::put("{$nextMarketPublic}/{$filename}", $contents);

            $storagePath = self::STORAGE_DIR.'/'.$filename;
            Storage::disk('public')->put($storagePath, $contents);
            $saved[] = $storagePath;
        }

        return $saved;
    }

    private function resolveSeedDir(): string
    {
        $candidates = [
            // Real source photos from web2autos-next
            base_path('../web2autos-next/prisma/seed-assets/2002-lexus-es300'),
            // Local mirror inside this repo
            public_path('images/demo-vehicles/2002-lexus-es300'),
        ];

        foreach ($candidates as $dir) {
            if (File::isDirectory($dir) && count(File::files($dir)) > 0) {
                return $dir;
            }
        }

        throw new \RuntimeException(
            'No Lexus ES 300 seed photos found. Expected web2autos-next/prisma/seed-assets/2002-lexus-es300.',
        );
    }
}
