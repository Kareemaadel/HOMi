import type { Request, Response, NextFunction } from 'express';
import { adminService, AdminError } from '../services/admin.service.js';
import { VerifyPropertySchema } from '../schemas/admin.schemas.js';
import { AuthError } from '../../auth/services/auth.service.js';
import { UserRole, User } from '../../auth/models/User.js';
import { generateTokenPair } from '../../../shared/utils/jwt.util.js';
import { activityLogService } from '../../../shared/services/activity-log.service.js';

class AdminController {
    /**
     * POST /api/admin/auth/login
     */
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                res.status(400).json({ success: false, message: 'Email and password are required' });
                return;
            }

            const normalizedEmail = String(email).trim().toLowerCase();
            const user = await User.findOne({ where: { email: normalizedEmail } });
            if (!user) {
                throw new AuthError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
            }

            const isPasswordValid = await user.comparePassword(String(password));
            if (!isPasswordValid) {
                throw new AuthError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
            }

            if (user.role !== UserRole.ADMIN) {
                res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
                return;
            }

            const tokens = generateTokenPair(user.id, user.email, user.role);
            const data = {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    isVerified: user.is_verified,
                    emailVerified: user.email_verified,
                    createdAt: user.created_at,
                },
            };

            res.status(200).json({
                success: true,
                message: 'Admin logged in successfully',
                data,
            });

            await activityLogService.log({
                actor: { userId: user.id, role: user.role, email: user.email },
                action: 'ADMIN_LOGIN',
                entityType: 'USER',
                entityId: user.id,
                description: 'Admin logged into admin panel.',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/dashboard/stats
     */
    async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const stats = await adminService.getDashboardStats();

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/properties/pending
     */
    async getPendingProperties(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const properties = await adminService.getPendingProperties();

            res.status(200).json({
                success: true,
                data: properties,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/admin/properties/:id/verify
     */
    async verifyProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const validated = VerifyPropertySchema.parse(req.body);
            const adminId = (req as any).user?.userId;

            const property = await adminService.verifyProperty(id as string, validated.action, validated.rejectionReason, adminId);

            res.status(200).json({
                success: true,
                message: `Property has been ${validated.action === 'APPROVE' ? 'approved' : 'rejected'}.`,
                data: property,
            });
        } catch (error) {
            next(error);
        }
    }

    async getListingReports(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const reports = await adminService.getListingReports();
            res.status(200).json({
                success: true,
                data: reports,
            });
        } catch (error) {
            next(error);
        }
    }

    async removeReportedListing(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reportId } = req.params;
            const adminId = (req as any).user.userId;
            const result = await adminService.removeListingFromReport(reportId as string, adminId);

            res.status(200).json({
                success: true,
                message: 'Reported listing removed successfully.',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async getActivityLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page ?? 1);
            const limit = Number(req.query.limit ?? 50);
            const result = await adminService.getActivityLogs(page, limit);
            res.status(200).json({
                success: true,
                data: result.logs,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;
            const profile = await adminService.getUserProfileForAdmin(String(userId));
            res.status(200).json({
                success: true,
                data: profile,
            });
        } catch (error) {
            next(error);
        }
    }

    async getPropertyDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { propertyId } = req.params;
            const property = await adminService.getPropertyDetailsForAdmin(String(propertyId));
            res.status(200).json({
                success: true,
                data: property,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const adminController = new AdminController();
export default adminController;
