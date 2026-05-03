/** Fired when `localStorage` access token is set or cleared so global listeners (e.g. maintenance gate) can re-sync. */
export const ACCESS_TOKEN_CHANGED_EVENT = 'homi-access-token-changed';

export function notifyAccessTokenChanged(): void {
    globalThis.dispatchEvent(new CustomEvent(ACCESS_TOKEN_CHANGED_EVENT));
}
