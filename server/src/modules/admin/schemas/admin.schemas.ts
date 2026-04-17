import { z } from 'zod';

export const VerifyPropertySchema = z.object({
    action: z.enum(['APPROVE', 'REJECT'], {
        errorMap: () => ({ message: "Action must be either 'APPROVE' or 'REJECT'" }),
    }),
    rejectionReason: z.string().optional(),
}).refine(
    (data) => {
        if (data.action === 'REJECT' && (!data.rejectionReason || data.rejectionReason.trim() === '')) {
            return false;
        }
        return true;
    },
    {
        message: 'Rejection reason is required when action is REJECT',
        path: ['rejectionReason'],
    }
);

export type VerifyPropertyInput = z.infer<typeof VerifyPropertySchema>;
