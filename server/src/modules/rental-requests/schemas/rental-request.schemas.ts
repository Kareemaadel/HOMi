import { z } from 'zod';
import { LivingSituation, RentalRequestStatus } from '../models/RentalRequest.js';

/**
 * Create Rental Request Schema
 */
export const CreateRentalRequestSchema = z.object({
    property_id: z
        .string({ error: 'Property ID is required' })
        .uuid('Property ID must be a valid UUID'),
    move_in_date: z
        .string({ error: 'Move-in date is required' })
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Move-in date must be in YYYY-MM-DD format'),
    duration: z
        .string({ error: 'Duration is required' })
        .regex(/^\d+_MONTHS$/, 'Duration must be in format like 18_MONTHS')
        .refine((value) => {
            const months = Number(value.replace('_MONTHS', ''));
            return Number.isInteger(months) && months >= 1 && months <= 120;
        }, 'Duration must be between 1 and 120 months'),
    occupants: z
        .number({ error: 'Occupants is required' })
        .int('Occupants must be an integer')
        .min(1, 'At least 1 occupant is required'),
    living_situation: z.enum(
        [LivingSituation.SINGLE, LivingSituation.FAMILY, LivingSituation.MARRIED, LivingSituation.STUDENTS],
        { message: 'Living situation must be SINGLE, FAMILY, MARRIED, or STUDENTS' }
    ),
    message: z
        .string()
        .max(2000, 'Message must be at most 2000 characters')
        .trim()
        .optional(),
});

export type CreateRentalRequestInput = z.infer<typeof CreateRentalRequestSchema>;

/**
 * Update Rental Request Status Schema
 */
export const UpdateRentalRequestStatusSchema = z.object({
    status: z.enum(
        [RentalRequestStatus.APPROVED, RentalRequestStatus.DECLINED],
        { message: 'Status must be APPROVED or DECLINED' }
    ),
});

export type UpdateRentalRequestStatusInput = z.infer<typeof UpdateRentalRequestStatusSchema>;

/**
 * Rental Request Query Schema
 * Validates query parameters for listing rental requests
 */
export const RentalRequestQuerySchema = z.object({
    status: z
        .enum([RentalRequestStatus.PENDING, RentalRequestStatus.APPROVED, RentalRequestStatus.DECLINED])
        .optional(),
    page: z
        .string()
        .regex(/^\d+$/, 'Page must be a positive integer')
        .default('1')
        .transform(Number)
        .optional(),
    limit: z
        .string()
        .regex(/^\d+$/, 'Limit must be a positive integer')
        .default('10')
        .transform(Number)
        .refine((val) => val <= 100, 'Limit cannot exceed 100')
        .optional(),
}).passthrough();

export type RentalRequestQueryInput = z.infer<typeof RentalRequestQuerySchema>;

export default {
    CreateRentalRequestSchema,
    UpdateRentalRequestStatusSchema,
    RentalRequestQuerySchema,
};
