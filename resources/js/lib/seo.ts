export function truncateDescription(text: string, maxLength = 160): string {
    const normalized = text.replace(/\s+/g, ' ').trim();

    if (normalized.length <= maxLength) {
        return normalized;
    }

    return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function toAbsoluteUrl(appUrl: string, path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    const base = appUrl.replace(/\/$/, '');
    const normalized = path.startsWith('/') ? path : `/${path}`;

    return `${base}${normalized}`;
}
