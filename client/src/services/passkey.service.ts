type StoredPasskey = {
    credentialId: string;
    enabled: boolean;
    createdAt: string;
};

type PasskeyStore = Record<string, StoredPasskey>;

const PASSKEY_STORE_KEY = 'homiPasskeysV1';
const encoder = new TextEncoder();

function randomChallenge(length = 32): Uint8Array {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

function toBase64Url(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach((b) => {
        binary += String.fromCharCode(b);
    });
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function getStore(): PasskeyStore {
    try {
        const raw = localStorage.getItem(PASSKEY_STORE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as PasskeyStore;
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function setStore(next: PasskeyStore): void {
    localStorage.setItem(PASSKEY_STORE_KEY, JSON.stringify(next));
}

function getCachedUserId(): string | null {
    try {
        const userRaw = localStorage.getItem('user');
        if (!userRaw) return null;
        const user = JSON.parse(userRaw) as { id?: string };
        return user?.id ?? null;
    } catch {
        return null;
    }
}

class PasskeyService {
    isSupported(): boolean {
        return typeof window !== 'undefined'
            && window.isSecureContext
            && typeof PublicKeyCredential !== 'undefined'
            && typeof navigator.credentials?.create === 'function'
            && typeof navigator.credentials?.get === 'function';
    }

    hasSavedPasskeyForCachedUser(): boolean {
        const userId = getCachedUserId();
        if (!userId) return false;
        const entry = getStore()[userId];
        return Boolean(entry?.enabled && entry.credentialId);
    }

    hasSavedPasskeyForCurrentUser(): boolean {
        return this.hasSavedPasskeyForCachedUser();
    }

    async registerPasskeyForCurrentUser(): Promise<void> {
        if (!this.isSupported()) throw new Error('Biometric/passkey is not supported on this browser.');

        const userId = getCachedUserId();
        if (!userId) throw new Error('Sign in first to set up biometric authentication.');

        const email = (() => {
            try {
                const userRaw = localStorage.getItem('user');
                if (!userRaw) return 'homi-user';
                const user = JSON.parse(userRaw) as { email?: string };
                return user.email ?? 'homi-user';
            } catch {
                return 'homi-user';
            }
        })();

        const credential = await navigator.credentials.create({
            publicKey: {
                challenge: randomChallenge(),
                rp: { name: 'HOMI' },
                user: {
                    id: encoder.encode(userId),
                    name: email,
                    displayName: email,
                },
                pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
                timeout: 60_000,
                authenticatorSelection: {
                    authenticatorAttachment: 'platform',
                    userVerification: 'required',
                    residentKey: 'preferred',
                },
                attestation: 'none',
            },
        });

        if (!credential || !(credential instanceof PublicKeyCredential)) {
            throw new Error('Failed to create biometric credentials.');
        }

        const rawId = new Uint8Array(credential.rawId);
        const store = getStore();
        store[userId] = {
            credentialId: toBase64Url(rawId),
            enabled: true,
            createdAt: new Date().toISOString(),
        };
        setStore(store);
    }

    async authenticateSavedPasskeyForCurrentUser(): Promise<boolean> {
        if (!this.isSupported()) return false;
        const userId = getCachedUserId();
        if (!userId) return false;
        const entry = getStore()[userId];
        if (!entry?.enabled || !entry.credentialId) return false;

        try {
            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge: randomChallenge(),
                    timeout: 60_000,
                    allowCredentials: [
                        {
                            type: 'public-key',
                            id: fromBase64Url(entry.credentialId),
                            transports: ['internal'],
                        },
                    ],
                    userVerification: 'required',
                },
            });

            return Boolean(assertion && assertion instanceof PublicKeyCredential);
        } catch {
            return false;
        }
    }

    disablePasskeyForCurrentUser(): void {
        const userId = getCachedUserId();
        if (!userId) return;
        const store = getStore();
        delete store[userId];
        setStore(store);
    }
}

export const passkeyService = new PasskeyService();

