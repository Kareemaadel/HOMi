import { z } from 'zod';
import { PropertyStatus, FurnishingStatus } from '../models/Property.js';

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
 * Property Specifications Schema
 */
export const PropertySpecificationsSchema = z.object({
    bedrooms: z
        .number({ error: 'Bedrooms is required' })
        .int('Bedrooms must be an integer')
        .min(0, 'Bedrooms cannot be negative'),
    bathrooms: z
        .number({ error: 'Bathrooms is required' })
        .int('Bathrooms must be an integer')
        .min(0, 'Bathrooms cannot be negative'),
    floor: z
        .number({ error: 'Floor is required' })
        .int('Floor must be an integer'),
    parking_spaces: z
        .number()
        .int('Parking spaces must be an integer')
        .min(0, 'Parking spaces cannot be negative')
        .default(0),
    area_sqft: z
        .number({ error: 'Area is required' })
        .positive('Area must be a positive number'),
    detailed_location: z
        .string({ error: 'Detailed location is required' })
        .min(1, 'Detailed location is required')
        .trim(),
});

export type PropertySpecificationsInput = z.infer<typeof PropertySpecificationsSchema>;

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
    monthly_price: z
        .number({ error: 'Monthly price is required' })
        .positive('Monthly price must be a positive number')
        .max(999999999.99, 'Monthly price is too large'),
    security_deposit: z
        .number({ error: 'Security deposit is required' })
        .min(0, 'Security deposit cannot be negative')
        .max(999999999.99, 'Security deposit is too large'),
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
    furnishing: z.enum(
        [FurnishingStatus.FULLY, FurnishingStatus.SEMI, FurnishingStatus.UNFURNISHED],
        { message: 'Furnishing must be Fully, Semi, or Unfurnished' }
    ),
    availability_date: z
        .string({ error: 'Availability date is required' })
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Availability date must be in YYYY-MM-DD format'),
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
    specifications: PropertySpecificationsSchema,
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
    monthly_price: z
        .number()
        .positive('Monthly price must be a positive number')
        .max(999999999.99, 'Monthly price is too large')
        .optional(),
    security_deposit: z
        .number()
        .min(0, 'Security deposit cannot be negative')
        .max(999999999.99, 'Security deposit is too large')
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
    furnishing: z.enum(
        [FurnishingStatus.FULLY, FurnishingStatus.SEMI, FurnishingStatus.UNFURNISHED],
        { message: 'Furnishing must be Fully, Semi, or Unfurnished' }
    ).optional(),
    status: z.enum(
        [PropertyStatus.DRAFT, PropertyStatus.PUBLISHED, PropertyStatus.RENTED],
        { message: 'Status must be Draft, Published, or Rented' }
    ).optional(),
    availability_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Availability date must be in YYYY-MM-DD format')
        .optional(),
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
    specifications: PropertySpecificationsSchema.partial().optional(),
});

export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>;

/**
 * Property Query Schema
 * Validates query parameters for listing properties
 * All parameters are optional - empty query is valid
 */
export const PropertyQuerySchema = z.object({
    status: z
        .enum([PropertyStatus.DRAFT, PropertyStatus.PUBLISHED, PropertyStatus.RENTED])
        .optional(),
    furnishing: z
        .enum([FurnishingStatus.FULLY, FurnishingStatus.SEMI, FurnishingStatus.UNFURNISHED])
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
    availabilityDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Availability date must be in YYYY-MM-DD format')
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
    PropertySpecificationsSchema,
};
