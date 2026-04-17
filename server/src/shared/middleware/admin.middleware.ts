import type { Request, Response, NextFunction } from 'express';
import { protect, restrictTo } from './auth.middleware.js';

export const requireAdmin = [
    protect,
    restrictTo('ADMIN'),
];
