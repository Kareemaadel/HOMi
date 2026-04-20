/** Public URL that opens this listing in Browse Properties (detail modal). */
export function buildListingShareUrl(propertyId: string): string {
    if (typeof window === 'undefined') {
        return `/browse-properties?listing=${encodeURIComponent(propertyId)}`;
    }
    return `${window.location.origin}/browse-properties?listing=${encodeURIComponent(propertyId)}`;
}
