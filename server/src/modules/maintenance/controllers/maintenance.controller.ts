import type { Request, Response, NextFunction } from 'express';
import { maintenanceService, MaintenanceError } from '../services/maintenance.service.js';
import {
    MaintenanceConflictResolution,
} from '../models/MaintenanceConflict.js';
import type {
    PostMaintenanceIssueInput,
    ProviderApplyInput,
    UpdateLocationInput,
    MarkProviderCompleteInput,
    ConfirmCompletionInput,
    AdminResolveConflictInput,
} from '../interfaces/maintenance.interfaces.js';

class MaintenanceController {
    // ─── Tenant context ────────────────────────────────────────────────

    async getTenantContext(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const ctx = await maintenanceService.getTenantActiveContext(userId);
            res.status(200).json({ success: true, data: ctx });
        } catch (err) {
            next(err);
        }
    }

    // ─── Tenant: post issue ───────────────────────────────────────────

    async postIssue(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const created = await maintenanceService.postIssue(userId, req.body as PostMaintenanceIssueInput);
            res.status(201).json({ success: true, data: created });
        } catch (err) {
            next(err);
        }
    }

    async listTenantRequests(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const status = req.query.status
                ? String(req.query.status)
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : undefined;
            const rows = await maintenanceService.listTenantRequests(userId, status as any);
            res.status(200).json({ success: true, data: rows });
        } catch (err) {
            next(err);
        }
    }

    async cancelRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;
            const updated = await maintenanceService.cancelRequest(userId, id as string);
            res.status(200).json({ success: true, data: updated });
        } catch (err) {
            next(err);
        }
    }

    async getAwaitingConfirmation(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const data = await maintenanceService.getAwaitingConfirmation(userId);
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }

    async confirmCompletion(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;
            const updated = await maintenanceService.confirmCompletion(
                userId,
                id as string,
                req.body as ConfirmCompletionInput
            );
            res.status(200).json({ success: true, data: updated });
        } catch (err) {
            next(err);
        }
    }

    // ─── Generic ──────────────────────────────────────────────────────

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = await maintenanceService.getRequest(id as string, {
                userId: req.user!.userId,
                role: req.user!.role,
            });
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }

    async listApplicationsForRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;
            const apps = await maintenanceService.listApplicationsForTenant(userId, id as string);
            res.status(200).json({ success: true, data: apps });
        } catch (err) {
            next(err);
        }
    }

    async acceptApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { applicationId } = req.params;
            const data = await maintenanceService.acceptApplication(userId, applicationId as string);
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }

    // ─── Browse providers ─────────────────────────────────────────────

    async listProviders(req: Request, res: Response, next: NextFunction) {
        try {
            const opts: { category?: string; type?: 'INDIVIDUAL' | 'CENTER'; search?: string } = {};
            if (req.query.category) opts.category = String(req.query.category);
            if (req.query.type === 'INDIVIDUAL' || req.query.type === 'CENTER') {
                opts.type = req.query.type;
            }
            if (req.query.search) opts.search = String(req.query.search);
            const list = await maintenanceService.listApprovedProviders(opts);
            res.status(200).json({ success: true, data: list });
        } catch (err) {
            next(err);
        }
    }

    // ─── Landlord ─────────────────────────────────────────────────────

    async listLandlordRequests(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const rows = await maintenanceService.listLandlordRequests(userId);
            res.status(200).json({ success: true, data: rows });
        } catch (err) {
            next(err);
        }
    }

    // ─── Provider ─────────────────────────────────────────────────────

    async listAvailableJobs(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const opts: { category?: string; search?: string } = {};
            if (req.query.category) opts.category = String(req.query.category);
            if (req.query.search) opts.search = String(req.query.search);
            const rows = await maintenanceService.listAvailableJobsForProvider(userId, opts);
            res.status(200).json({ success: true, data: rows });
        } catch (err) {
            next(err);
        }
    }

    async listProviderRequests(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const status = req.query.status
                ? String(req.query.status)
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : undefined;
            const rows = await maintenanceService.listProviderRequests(userId, status as any);
            res.status(200).json({ success: true, data: rows });
        } catch (err) {
            next(err);
        }
    }

    async listMyApplications(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const rows = await maintenanceService.listMyApplications(userId);
            res.status(200).json({ success: true, data: rows });
        } catch (err) {
            next(err);
        }
    }

    async applyToRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;
            const data = await maintenanceService.applyToRequest(
                userId,
                id as string,
                req.body as ProviderApplyInput
            );
            res.status(201).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }

    async setEnRoute(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;
            const data = await maintenanceService.providerSetEnRoute(userId, id as string);
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }

    async setArrived(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;
            const data = await maintenanceService.providerArrived(userId, id as string);
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }

    async updateLocation(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;
            const data = await maintenanceService.updateLocation(
                userId,
                id as string,
                req.body as UpdateLocationInput
            );
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }

    async getCurrentLocation(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = await maintenanceService.getCurrentLocation(id as string, {
                userId: req.user!.userId,
                role: req.user!.role,
            });
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }

    async markComplete(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;
            const data = await maintenanceService.markProviderComplete(
                userId,
                id as string,
                req.body as MarkProviderCompleteInput
            );
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }

    async getProviderEarnings(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const data = await maintenanceService.getProviderEarnings(userId);
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }

    // ─── Admin ───────────────────────────────────────────────────────

    async listAdminConflicts(req: Request, res: Response, next: NextFunction) {
        try {
            const all = String(req.query.all ?? 'false') === 'true';
            const data = all
                ? await maintenanceService.listAllConflictsForAdmin()
                : await maintenanceService.listOpenConflictsForAdmin();
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }

    async resolveConflict(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = req.user!.userId;
            const { conflictId } = req.params;
            const body = req.body as AdminResolveConflictInput;
            if (
                body.resolution !== MaintenanceConflictResolution.CHARGE_TENANT &&
                body.resolution !== MaintenanceConflictResolution.CHARGE_PROVIDER
            ) {
                throw new MaintenanceError('Invalid resolution', 400, 'INVALID_RESOLUTION');
            }
            const data = await maintenanceService.resolveConflict(adminId, conflictId as string, body);
            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }
}

export const maintenanceController = new MaintenanceController();
export default maintenanceController;
