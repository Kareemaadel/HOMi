import { z } from 'zod';
import { PropertyStatus } from '../models/Property.js';

/**
 * Property Image Schema
 */
export const PropertyImageSchema = z.object({
    image_url: z
        .string()
        .url('Image URL must be a valid URL')
        .max(500, 'Image URL must be at most 500 characters'),
    is_main: z
        .boolean()
        .default(false),
});

export type PropertyImageInput = z.infer<typeof PropertyImageSchema>;

/**
 * Create Property Schema
 * Validates property creation request
 */
export const CreatePropertySchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(255, 'Title must be at most 255 characters')
        .trim(),
    description: z
        .string()
        .min(1, 'Description is required')
        .trim(),
    price: z
        .number()
        .positive('Price must be a positive number')
        .max(999999999.99, 'Price is too large'),
    address: z
        .string()
        .min(1, 'Address is required')
        .trim(),
    location_lat: z
        .number()
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90'),
    location_long: z
        .number()
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180'),
    images: z
        .array(PropertyImageSchema)
        .min(1, 'At least one image is required')
        .refine(
            (images) => {
                // Ensure at most one main image
                const mainImages = images.filter(img => img.is_main);
                return mainImages.length <= 1;
            },
            {
                message: 'Only one image can be marked as main',
            }
        ),
    amenity_names: z
        .array(z.string().min(1, 'Amenity name cannot be empty'))
        .optional()
        .default([]),
});

export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;

/**
 * Update Property Schema
 * All fields are optional
 */
export const UpdatePropertySchema = z.object({
    title: z
        .string()
        .min(1, 'Title cannot be empty')
        .max(255, 'Title must be at most 255 characters')
        .trim()
        .optional(),
    description: z
        .string()
        .min(1, 'Description cannot be empty')
        .trim()
        .optional(),
    price: z
        .number()
        .positive('Price must be a positive number')
        .max(999999999.99, 'Price is too large')
        .optional(),
    address: z
        .string()
        .min(1, 'Address cannot be empty')
        .trim()
        .optional(),
    location_lat: z
        .number()
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90')
        .optional(),
    location_long: z
        .number()
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180')
        .optional(),
    status: z.enum([
        PropertyStatus.AVAILABLE,
        PropertyStatus.RENTED,
        PropertyStatus.UNAVAILABLE
    ], {
        message: 'Status must be AVAILABLE, RENTED, or UNAVAILABLE',
    }).optional(),
    images: z
        .array(PropertyImageSchema)
        .min(1, 'At least one image is required if updating images')
        .refine(
            (images) => {
                const mainImages = images.filter(img => img.is_main);
                return mainImages.length <= 1;
            },
            {
                message: 'Only one image can be marked as main',
            }
        )
        .optional(),
    amenity_names: z
        .array(z.string().min(1, 'Amenity name cannot be empty'))
        .optional(),
});

export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>;

/**
 * Property Query Schema
 * Validates query parameters for listing properties
 * All parameters are optional - empty query is valid
 */
export const PropertyQuerySchema = z.object({
    status: z
        .enum([
            PropertyStatus.AVAILABLE,
            PropertyStatus.RENTED,
            PropertyStatus.UNAVAILABLE
        ])
        .optional(),
    minPrice: z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format')
        .transform(Number)
        .optional(),
    maxPrice: z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format')
        .transform(Number)
        .optional(),
    landlordId: z
        .string()
        .uuid('Invalid landlord ID format')
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
}).refine(
    (data) => {
        if (data.minPrice && data.maxPrice) {
            return data.minPrice <= data.maxPrice;
        }
        return true;
    },
    {
        message: 'Minimum price must be less than or equal to maximum price',
        path: ['minPrice'],
    }
).passthrough(); // Allow empty query object

export type PropertyQueryInput = z.infer<typeof PropertyQuerySchema>;

export default {
    CreatePropertySchema,
    UpdatePropertySchema,
    PropertyQuerySchema,
    PropertyImageSchema,
};
