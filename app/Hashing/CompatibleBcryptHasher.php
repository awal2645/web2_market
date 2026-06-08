<?php

namespace App\Hashing;

use Illuminate\Hashing\BcryptHasher;

/**
 * Accepts bcrypt hashes from web2autos-next (bcryptjs uses $2a$ / $2b$ prefixes).
 * PHP's password_get_info() only labels $2y$ as "bcrypt", but password_verify()
 * works for all variants — so we widen the algorithm check for shared login.
 */
class CompatibleBcryptHasher extends BcryptHasher
{
    protected function isUsingCorrectAlgorithm($hashedValue): bool
    {
        if (parent::isUsingCorrectAlgorithm($hashedValue)) {
            return true;
        }

        return preg_match('/^\$2[aby]\$\d{2}\$/', (string) $hashedValue) === 1;
    }
}
