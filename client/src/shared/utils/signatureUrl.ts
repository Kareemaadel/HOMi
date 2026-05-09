const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const SIGNATURES_BASE_URL = (import.meta.env.VITE_SIGNATURES_BASE_URL as string | undefined)?.trim();

function getApiOrigin(): string {
    try {
        return new URL(API_BASE_URL, globalThis.location.origin).origin;
    } catch {
        return globalThis.location.origin;
    }
}

export function normalizeSignatureUrl(value?: string | null): string | undefined {
    const raw = String(value ?? '').trim();
    if (!raw) return undefined;

    if (raw.startsWith('data:image/')) return raw;
    if (/^https?:\/\//i.test(raw)) {
        try {
            const parsed = new URL(raw);
            const hostLooksLikeFileName = /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(parsed.hostname);
            const hasNoPath = parsed.pathname === '/' || parsed.pathname === '';
            if (hostLooksLikeFileName && hasNoPath) {
                return `${getApiOrigin()}/signatures/${parsed.hostname}`;
            }
            return raw;
        } catch {
            return `${getApiOrigin()}/signatures/${raw.replace(/^https?:\/\//i, '')}`;
        }
    }
    if (raw.startsWith('//')) return `${globalThis.location.protocol}${raw}`;

    const base = SIGNATURES_BASE_URL?.replace(/\/$/, '');
    if (base) {
        return `${base}/${raw.replace(/^\//, '')}`;
    }

    if (raw.startsWith('/')) {
        return `${getApiOrigin()}${raw}`;
    }

    // Backward compatibility for signature values saved as plain filenames.
    return `${getApiOrigin()}/signatures/${raw}`;
}
