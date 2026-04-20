import { Op } from 'sequelize';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
    RegistrationResponseJSON,
    AuthenticationResponseJSON,
    AuthenticatorTransportFuture,
    WebAuthnCredential,
} from '@simplewebauthn/server';
import env from '../../../config/env.js';
import { authService, AuthError } from './auth.service.js';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { UserPasskey } from '../models/UserPasskey.js';
import { WebAuthnChallenge } from '../models/WebAuthnChallenge.js';
import type { LoginResponse } from '../interfaces/auth.interfaces.js';

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

function toCredentialDescriptor(c: UserPasskey): { id: string; transports?: AuthenticatorTransportFuture[] } {
    const out: { id: string; transports?: AuthenticatorTransportFuture[] } = { id: c.credential_id };
    const raw = c.transports;
    if (Array.isArray(raw) && raw.length > 0) {
        out.transports = raw as AuthenticatorTransportFuture[];
    }
    return out;
}

function getRpId(): string {
    if (env.WEBAUTHN_RP_ID) return env.WEBAUTHN_RP_ID.trim();
    try {
        return new URL(env.CLIENT_URL).hostname;
    } catch {
        return 'localhost';
    }
}

function getExpectedOrigin(): string {
    return (env.WEBAUTHN_ORIGIN || env.CLIENT_URL).trim();
}

async function saveChallenge(
    userId: string,
    kind: 'registration' | 'authentication',
    challenge: string
): Promise<void> {
    await WebAuthnChallenge.destroy({ where: { user_id: userId, kind } });
    await WebAuthnChallenge.create({
        user_id: userId,
        challenge,
        kind,
        expires_at: new Date(Date.now() + CHALLENGE_TTL_MS),
    });
}

async function consumeChallenge(
    userId: string,
    kind: 'registration' | 'authentication',
    expectedChallenge: string
): Promise<void> {
    const row = await WebAuthnChallenge.findOne({
        where: {
            user_id: userId,
            kind,
            challenge: expectedChallenge,
            expires_at: { [Op.gt]: new Date() },
        },
    });
    if (!row) {
        throw new AuthError('Passkey challenge expired or invalid.', 400, 'INVALID_WEBAUTHN_CHALLENGE');
    }
    await row.destroy();
}

async function getLatestChallenge(
    userId: string,
    kind: 'registration' | 'authentication'
): Promise<string | null> {
    const row = await WebAuthnChallenge.findOne({
        where: {
            user_id: userId,
            kind,
            expires_at: { [Op.gt]: new Date() },
        },
        order: [['created_at', 'DESC']],
    });
    return row?.challenge ?? null;
}

export class WebAuthnService {
    async registrationOptions(userId: string) {
        const user = await User.findByPk(userId, {
            include: [{ model: Profile, as: 'profile', required: false }],
        });
        if (!user) {
            throw new AuthError('User not found', 404, 'USER_NOT_FOUND');
        }

        const rpID = getRpId();
        const existing = await UserPasskey.findAll({ where: { user_id: userId } });
        const displayName = user.profile
            ? `${user.profile.first_name} ${user.profile.last_name}`.trim() || user.email
            : user.email;

        const excludeCredentials = existing.map((c) => toCredentialDescriptor(c));

        const options = await generateRegistrationOptions({
            rpName: 'HOMI',
            rpID,
            userName: user.email,
            userID: Buffer.from(userId, 'utf8'),
            userDisplayName: displayName,
            attestationType: 'none',
            excludeCredentials,
            authenticatorSelection: {
                authenticatorAttachment: 'platform',
                userVerification: 'required',
                residentKey: 'preferred',
            },
            supportedAlgorithmIDs: [-7, -257],
        });

        await saveChallenge(userId, 'registration', options.challenge);
        return options;
    }

    async registrationVerify(userId: string, response: RegistrationResponseJSON): Promise<void> {
        const challenge = await getLatestChallenge(userId, 'registration');
        if (!challenge) {
            throw new AuthError('Passkey challenge expired. Please try again.', 400, 'INVALID_WEBAUTHN_CHALLENGE');
        }

        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge: challenge,
            expectedOrigin: getExpectedOrigin(),
            expectedRPID: getRpId(),
            requireUserVerification: true,
        });

        if (!verification.verified || !verification.registrationInfo) {
            throw new AuthError('Passkey registration could not be verified.', 400, 'PASSKEY_VERIFICATION_FAILED');
        }

        const { credential } = verification.registrationInfo;
        const publicKeyB64 = Buffer.from(credential.publicKey).toString('base64');

        await UserPasskey.create({
            user_id: userId,
            credential_id: credential.id,
            public_key: publicKeyB64,
            counter: credential.counter,
            transports: credential.transports ?? null,
        });

        await consumeChallenge(userId, 'registration', challenge);
    }

    async authenticationOptions(identifier: string) {
        const user = await authService.findUserByLoginIdentifier(identifier.trim());
        if (!user) {
            throw new AuthError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        const creds = await UserPasskey.findAll({ where: { user_id: user.id } });
        if (creds.length === 0) {
            throw new AuthError('No passkey registered for this account.', 400, 'NO_PASSKEYS');
        }

        const allowCredentials = creds.map((c) => toCredentialDescriptor(c));

        const options = await generateAuthenticationOptions({
            rpID: getRpId(),
            allowCredentials,
            userVerification: 'required',
        });

        await saveChallenge(user.id, 'authentication', options.challenge);
        return options;
    }

    async authenticationVerify(
        identifier: string,
        response: AuthenticationResponseJSON
    ): Promise<LoginResponse> {
        const user = await authService.findUserByLoginIdentifier(identifier.trim());
        if (!user) {
            throw new AuthError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        const challenge = await getLatestChallenge(user.id, 'authentication');
        if (!challenge) {
            throw new AuthError('Passkey challenge expired. Please try again.', 400, 'INVALID_WEBAUTHN_CHALLENGE');
        }

        const credentialRow = await UserPasskey.findOne({
            where: { user_id: user.id, credential_id: response.id },
        });
        if (!credentialRow) {
            throw new AuthError('Unknown passkey credential.', 400, 'UNKNOWN_PASSKEY');
        }

        const pkBytes = new Uint8Array(Buffer.from(credentialRow.public_key, 'base64'));
        const tr = credentialRow.transports;

        const credentialForVerify: WebAuthnCredential = {
            id: credentialRow.credential_id,
            publicKey: pkBytes,
            counter: Number(credentialRow.counter),
            ...(Array.isArray(tr) && tr.length > 0
                ? { transports: tr as AuthenticatorTransportFuture[] }
                : {}),
        };

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge: challenge,
            expectedOrigin: getExpectedOrigin(),
            expectedRPID: getRpId(),
            credential: credentialForVerify,
            requireUserVerification: true,
        });

        if (!verification.verified) {
            throw new AuthError('Passkey authentication could not be verified.', 400, 'PASSKEY_VERIFICATION_FAILED');
        }

        await credentialRow.update({
            counter: verification.authenticationInfo.newCounter,
        });

        await consumeChallenge(user.id, 'authentication', challenge);

        return authService.loginWithPasskey(user);
    }

    async listPasskeys(userId: string) {
        const rows = await UserPasskey.findAll({
            where: { user_id: userId },
            order: [['created_at', 'ASC']],
            attributes: ['id', 'credential_id', 'created_at'],
        });
        return rows.map((r) => ({
            id: r.id,
            credentialId: r.credential_id,
            createdAt: r.created_at,
        }));
    }

    async deleteAllPasskeys(userId: string): Promise<void> {
        await UserPasskey.destroy({ where: { user_id: userId } });
    }
}

export const webauthnService = new WebAuthnService();
