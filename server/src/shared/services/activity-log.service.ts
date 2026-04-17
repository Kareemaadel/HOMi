import { ActivityLog } from '../../modules/admin/models/ActivityLog.js';

type ActivityActor = {
    userId?: string | null;
    role?: string | null;
    email?: string | null;
};

type LogActivityInput = {
    actor?: ActivityActor;
    action: string;
    entityType: string;
    entityId?: string | null;
    description: string;
    metadata?: Record<string, any> | null;
};

class ActivityLogService {
    async log(input: LogActivityInput): Promise<void> {
        try {
            await ActivityLog.create({
                actor_user_id: input.actor?.userId ?? null,
                actor_role: input.actor?.role ?? null,
                actor_email: input.actor?.email ?? null,
                action: input.action,
                entity_type: input.entityType,
                entity_id: input.entityId ?? null,
                description: input.description,
                metadata: input.metadata ?? null,
            });
        } catch (error) {
            console.error('Activity log failed:', error);
        }
    }
}

export const activityLogService = new ActivityLogService();
export default activityLogService;
