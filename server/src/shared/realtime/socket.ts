import { Server as HttpServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import { env } from '../../config/env.js';
import { extractBearerToken, verifyAccessToken, type JWTPayload } from '../utils/jwt.util.js';
import { messageService } from '../../modules/messages/services/message.service.js';

interface AuthedSocket extends Socket {
    data: {
        user?: JWTPayload;
    };
}

let io: Server | null = null;

function resolveToken(socket: Socket): string | null {
    const authToken = socket.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) {
        return authToken.trim();
    }

    const authorization = socket.handshake.headers.authorization;
    return extractBearerToken(authorization);
}

export function initSocketServer(server: HttpServer): Server {
    io = new Server(server, {
        cors: {
            origin: env.NODE_ENV === 'production'
                ? ['https://homi.app']
                : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
            credentials: true,
        },
    });

    io.use((socket, next) => {
        try {
            const token = resolveToken(socket);
            if (!token) {
                return next(new Error('Unauthorized: missing token'));
            }

            const decoded = verifyAccessToken(token);
            (socket as AuthedSocket).data.user = decoded;
            return next();
        } catch {
            return next(new Error('Unauthorized: invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const authedSocket = socket as AuthedSocket;
        const user = authedSocket.data.user;

        if (!user) {
            socket.disconnect(true);
            return;
        }

        socket.join(`user:${user.userId}`);

        socket.on('conversation:join', async (payload: { conversationId?: string }) => {
            const conversationId = payload?.conversationId;
            if (!conversationId) {
                return;
            }

            const canAccess = await messageService.canUserAccessConversation(user.userId, conversationId);
            if (!canAccess) {
                return;
            }

            socket.join(`conversation:${conversationId}`);
        });

        socket.on('conversation:leave', (payload: { conversationId?: string }) => {
            const conversationId = payload?.conversationId;
            if (!conversationId) {
                return;
            }

            socket.leave(`conversation:${conversationId}`);
        });
    });

    return io;
}

export function getIO(): Server {
    if (!io) {
        throw new Error('Socket.IO has not been initialized');
    }
    return io;
}

export default {
    initSocketServer,
    getIO,
};
