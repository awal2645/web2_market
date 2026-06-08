const DIGITS_ONLY = /\D/g;

export function formatPhoneForInput(phone: string): string {
    const digits = phone.replace(DIGITS_ONLY, '');

    if (digits.length === 11 && digits.startsWith('1')) {
        const local = digits.slice(1);

        return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
    }

    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    return phone;
}

export function isValidPhoneInput(phone: string): boolean {
    const digits = phone.replace(DIGITS_ONLY, '');

    return digits.length >= 10 && digits.length <= 15;
}
