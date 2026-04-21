import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { authService } from './auth.service';

class PasskeyService {
    isSupported(): boolean {
        return (
            typeof window !== 'undefined' &&
            window.isSecureContext &&
            typeof PublicKeyCredential !== 'undefined' &&
            typeof navigator.credentials?.create === 'function' &&
            typeof navigator.credentials?.get === 'function'
        );
    }

    hasSavedPasskeyForCachedUser(): boolean {
        return localStorage.getItem('passkeyEnabled') === '1';
    }

    hasSavedPasskeyForCurrentUser(): boolean {
        return this.hasSavedPasskeyForCachedUser();
    }

    async registerPasskeyForCurrentUser(): Promise<void> {
        if (!this.isSupported()) {
            throw new Error('Biometric/passkey authentication is not supported on this browser.');
        }
        if (!authService.isAuthenticated()) {
            throw new Error('Sign in first to set up biometric authentication.');
        }

        const optionsJSON = await authService.getPasskeyRegistrationOptions();
        const attResp = await startRegistration({ optionsJSON });
        await authService.verifyPasskeyRegistration(attResp);
    }

    /**
     * Sign in with passkey (identifier must match the account used at registration).
     */
    async authenticateWithPasskey(identifier: string, rememberMe?: boolean): Promise<void> {
        if (!this.isSupported()) {
            throw new Error('Biometric/passkey authentication is not supported on this browser.');
        }
        const trimmed = identifier.trim();
        if (!trimmed) {
            throw new Error('Enter your email or phone first.');
        }

        const optionsJSON = await authService.getPasskeyAuthenticationOptions(trimmed);
        const assertion = await startAuthentication({ optionsJSON });
        await authService.verifyPasskeyAuthentication(trimmed, assertion, rememberMe);
    }

    async disablePasskeyForCurrentUser(): Promise<void> {
        await authService.deletePasskeys();
    }
}

export const passkeyService = new PasskeyService();
