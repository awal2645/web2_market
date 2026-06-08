<?php

namespace App\Support;

class PhoneNumber
{
    public static function normalize(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';

        if (strlen($digits) === 10) {
            return '+1'.$digits;
        }

        if (strlen($digits) === 11 && str_starts_with($digits, '1')) {
            return '+'.$digits;
        }

        return '+'.$digits;
    }

    public static function isValid(string $phone): bool
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';

        return strlen($digits) >= 10 && strlen($digits) <= 15;
    }

    public static function formatForDisplay(?string $phone): string
    {
        if ($phone === null || $phone === '') {
            return '';
        }

        $digits = preg_replace('/\D+/', '', $phone) ?? '';

        if (strlen($digits) === 11 && str_starts_with($digits, '1')) {
            $local = substr($digits, 1);

            return sprintf(
                '(%s) %s-%s',
                substr($local, 0, 3),
                substr($local, 3, 3),
                substr($local, 6),
            );
        }

        if (strlen($digits) === 10) {
            return sprintf(
                '(%s) %s-%s',
                substr($digits, 0, 3),
                substr($digits, 3, 3),
                substr($digits, 6),
            );
        }

        return $phone;
    }
}
