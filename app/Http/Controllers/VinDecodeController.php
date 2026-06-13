<?php

namespace App\Http\Controllers;

use App\Services\VinDecoder;
use Illuminate\Http\JsonResponse;

class VinDecodeController extends Controller
{
    public function __invoke(string $vin, VinDecoder $decoder): JsonResponse
    {
        $data = $decoder->decode($vin);

        if ($data === null) {
            return response()->json([
                'message' => 'Unable to decode VIN.',
            ], 422);
        }

        return response()->json(['data' => $data]);
    }
}
