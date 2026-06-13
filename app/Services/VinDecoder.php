<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class VinDecoder
{
    /**
     * @return array<string, mixed>|null
     */
    public function decode(string $vin): ?array
    {
        $vin = strtoupper(trim($vin));

        if (strlen($vin) !== 17) {
            return null;
        }

        $response = Http::timeout(10)->get(
            'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/'.urlencode($vin),
            ['format' => 'json'],
        );

        if (! $response->successful()) {
            return null;
        }

        $results = collect($response->json('Results', []));

        $value = fn (string $variable) => $results
            ->firstWhere('Variable', $variable)['Value'] ?? null;

        $year = $value('Model Year');
        $make = $value('Make');
        $model = $value('Model');
        $trim = $value('Trim');

        if (! $make && ! $model && ! $year) {
            return null;
        }

        return [
            'year' => is_numeric($year) ? (int) $year : null,
            'make' => $make ?: null,
            'model' => $model ?: null,
            'trim' => $trim ?: null,
            'body_type' => $value('Body Class') ?: null,
            'fuel_type' => $value('Fuel Type - Primary') ?: null,
            'drivetrain' => $value('Drive Type') ?: null,
            'transmission' => $value('Transmission Style') ?: null,
        ];
    }
}
