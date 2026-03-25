import { describe, it, expect, vi } from 'vitest';
import { encrypt, decrypt, generateSecureToken, hashToken } from '../../../src/shared/utils/encryption.util.js';

vi.mock('../../../src/config/env.js', () => ({
    default: {
        ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    },
}));

describe('Encryption Utility', () => {
    const plaintext = 'Sensitive Data 123';

    describe('encrypt & decrypt', () => {
        it('should encrypt and then decrypt back to the original plaintext', () => {
            const encrypted = encrypt(plaintext);
            
            // Format should be iv:authTag:ciphertext
            expect(encrypted).toContain(':');
            const parts = encrypted.split(':');
            expect(parts).toHaveLength(3);

            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(plaintext);
        });

        it('should produce different ciphertexts for the same plaintext (due to random IV)', () => {
            const encrypted1 = encrypt(plaintext);
            const encrypted2 = encrypt(plaintext);
            expect(encrypted1).not.toBe(encrypted2);
        });

        it('should throw error for invalid encrypted text format', () => {
            const invalidFormat = 'invalid:format';
            expect(() => decrypt(invalidFormat)).toThrow('Invalid encrypted text format');
        });

        it('should throw error if authentication tag is tampered with', () => {
            const encrypted = encrypt(plaintext);
            const [iv, authTag, ciphertext] = encrypted.split(':');
            
            // Tamper with the ciphertext
            const tamperedCiphertext = ciphertext?.substring(0, ciphertext.length - 2) + (ciphertext?.endsWith('0') ? '1' : '0');
            const tampered = `${iv}:${authTag}:${tamperedCiphertext}`;
            
            expect(() => decrypt(tampered)).toThrow();
        });
    });

    describe('generateSecureToken', () => {
        it('should generate a 32-byte (64-char) hex token and its SHA-256 hash', () => {
            const { token, hashedToken } = generateSecureToken();
            
            expect(token).toHaveLength(64);
            expect(hashedToken).toHaveLength(64);
            
            // Verify hash match
            const reHashed = hashToken(token);
            expect(reHashed).toBe(hashedToken);
        });

        it('should generate unique tokens each time', () => {
            const token1 = generateSecureToken().token;
            const token2 = generateSecureToken().token;
            expect(token1).not.toBe(token2);
        });
    });

    describe('hashToken', () => {
        it('should produce a valid SHA-256 hash', () => {
            const data = 'test-token';
            const hash = hashToken(data);
            
            expect(hash).toHaveLength(64);
            // Pre-calculated SHA-256 of 'test-token'
            expect(hash).toBe('4c5dc9b7708905f77f5e5d16316b5dfb425e68cb326dcd55a860e90a7707031e');
        });
    });
});
