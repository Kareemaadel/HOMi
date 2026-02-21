import swaggerJsdoc, { type Options } from 'swagger-jsdoc';

const options: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'HOMi API Documentation',
            version: '1.0.0',
            description: 'REST API documentation for the HOMi rental management platform',
            contact: {
                name: 'HOMi Support',
                email: 'support@homi.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT access token',
                },
            },
            schemas: {
                // ─── Shared / Auth ────────────────────────────────────────────────────────
                UserRole: {
                    type: 'string',
                    enum: ['LANDLORD', 'TENANT', 'MAINTENANCE_PROVIDER', 'ADMIN'],
                    description: 'User role in the system',
                },
                Gender: {
                    type: 'string',
                    enum: ['MALE', 'FEMALE'],
                    description: 'User gender',
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        role: { $ref: '#/components/schemas/UserRole' },
                        isVerified: { type: 'boolean', description: 'Whether user has completed full verification (profile + email)' },
                        emailVerified: { type: 'boolean', description: 'Whether user email address is verified' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Profile: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        userId: { type: 'string', format: 'uuid' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        phoneNumber: { type: 'string' },
                        bio: { type: 'string', nullable: true },
                        avatarUrl: { type: 'string', nullable: true },
                        gender: { $ref: '#/components/schemas/Gender', nullable: true },
                        birthdate: { type: 'string', format: 'date', nullable: true },
                        gamificationPoints: { type: 'integer' },
                        preferredBudgetMin: { type: 'number', nullable: true },
                        preferredBudgetMax: { type: 'number', nullable: true },
                        isVerificationComplete: { type: 'boolean' },
                    },
                },

                // Auth Requests
                RegisterRequest: {
                    type: 'object',
                    required: ['email', 'password', 'firstName', 'lastName', 'phone', 'role'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            maxLength: 255,
                            example: 'user@example.com',
                        },
                        password: {
                            type: 'string',
                            minLength: 8,
                            maxLength: 100,
                            description: 'Must contain uppercase, lowercase, and digit',
                            example: 'SecurePass123',
                        },
                        firstName: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 100,
                            example: 'John',
                        },
                        lastName: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 100,
                            example: 'Doe',
                        },
                        phone: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 20,
                            example: '+201234567890',
                        },
                        role: {
                            type: 'string',
                            enum: ['LANDLORD', 'TENANT'],
                            description: 'Only LANDLORD or TENANT can self-register',
                            example: 'TENANT',
                        },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['identifier', 'password'],
                    description: 'Login with email or phone number. The system auto-detects which one you provided.',
                    properties: {
                        identifier: {
                            type: 'string',
                            description: 'Email address or phone number',
                            example: 'user@example.com',
                        },
                        password: {
                            type: 'string',
                            example: 'SecurePass123',
                        },
                    },
                },
                CompleteVerificationRequest: {
                    type: 'object',
                    description: 'Request body for completing account verification. Note: User ID is extracted from the JWT token in the Authorization header, not from this request body.',
                    required: ['nationalId', 'gender', 'birthdate'],
                    properties: {
                        nationalId: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 50,
                            description: 'National ID number (will be encrypted before storage)',
                            example: '29901011234567',
                        },
                        gender: {
                            type: 'string',
                            enum: ['MALE', 'FEMALE'],
                            description: 'User gender',
                            example: 'MALE',
                        },
                        birthdate: {
                            type: 'string',
                            format: 'date',
                            description: 'Date of birth in YYYY-MM-DD format',
                            example: '1999-01-01',
                        },
                    },
                },
                ForgotPasswordRequest: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com',
                        },
                    },
                },
                ResetPasswordRequest: {
                    type: 'object',
                    required: ['token', 'newPassword'],
                    properties: {
                        token: {
                            type: 'string',
                            minLength: 64,
                            maxLength: 64,
                            description: 'Reset token from email',
                        },
                        newPassword: {
                            type: 'string',
                            minLength: 8,
                            maxLength: 100,
                            description: 'Must contain uppercase, lowercase, and digit',
                            example: 'NewSecurePass456',
                        },
                    },
                },

                // Auth Responses
                AuthSuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string', description: 'JWT access token (15m expiry)' },
                        refreshToken: { type: 'string', description: 'JWT refresh token (7d expiry)' },
                        user: { $ref: '#/components/schemas/User' },
                        profile: { $ref: '#/components/schemas/Profile' },
                    },
                },
                UserProfileResponse: {
                    type: 'object',
                    description: 'Response for GET /auth/me endpoint containing user and profile data',
                    properties: {
                        user: { $ref: '#/components/schemas/User' },
                        profile: { $ref: '#/components/schemas/Profile' },
                    },
                },
                ValidationError: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Validation failed' },
                        code: { type: 'string', example: 'VALIDATION_ERROR' },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: { type: 'string' },
                                    message: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        code: { type: 'string' },
                    },
                },

                // Update Profile
                UpdateProfileRequest: {
                    type: 'object',
                    description: 'Request body for updating user profile. All fields are optional.',
                    properties: {
                        firstName: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 100,
                            description: 'Updated first name',
                            example: 'John',
                        },
                        lastName: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 100,
                            description: 'Updated last name',
                            example: 'Doe',
                        },
                        phone: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 20,
                            description: 'Updated phone number',
                            example: '+201234567890',
                        },
                        bio: {
                            type: 'string',
                            maxLength: 500,
                            nullable: true,
                            description: 'User bio or description',
                            example: 'Software developer passionate about real estate',
                        },
                        avatarUrl: {
                            type: 'string',
                            format: 'uri',
                            maxLength: 500,
                            nullable: true,
                            description: 'URL to user avatar image',
                            example: 'https://example.com/avatar.jpg',
                        },
                        preferredBudgetMin: {
                            type: 'number',
                            nullable: true,
                            description: 'Minimum preferred budget for property search',
                            example: 5000,
                        },
                        preferredBudgetMax: {
                            type: 'number',
                            nullable: true,
                            description: 'Maximum preferred budget for property search',
                            example: 10000,
                        },
                    },
                },

                // Email Verification
                EmailVerificationResponse: {
                    type: 'object',
                    description: 'Response for email verification endpoints',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Verification email sent. Please check your inbox.' },
                        emailVerified: {
                            type: 'boolean',
                            description: 'Whether the email is now verified',
                            example: false,
                        },
                    },
                },

                // ─── Property Enums ───────────────────────────────────────────────────────
                PropertyStatus: {
                    type: 'string',
                    enum: ['Draft', 'Published', 'Rented'],
                    description: 'Property listing status. Newly created properties start as **Draft**. Landlords publish them (**Published**) to make them visible to tenants. Once a tenant is found, status changes to **Rented**.',
                    example: 'Draft',
                },
                PropertyType: {
                    type: 'string',
                    enum: ['APARTMENT', 'VILLA', 'STUDIO', 'CHALET'],
                    description: 'Type of the property unit',
                    example: 'APARTMENT',
                },
                FurnishingStatus: {
                    type: 'string',
                    enum: ['Fully', 'Semi', 'Unfurnished'],
                    description: 'Furnishing level of the property. **Fully** = all furniture and appliances included. **Semi** = kitchen appliances + basic fixtures. **Unfurnished** = bare unit.',
                    example: 'Fully',
                },
                TargetTenant: {
                    type: 'string',
                    enum: ['ANY', 'STUDENTS', 'FAMILIES', 'TOURISTS'],
                    description: 'Preferred tenant type the landlord is targeting. Defaults to **ANY**.',
                    example: 'ANY',
                },

                // ─── Amenities ────────────────────────────────────────────────────────────
                AmenityName: {
                    type: 'string',
                    description: 'Available amenity name — must exactly match one of the seeded values',
                    enum: [
                        'Private Parking',
                        'Smart Home System',
                        '24/7 Concierge',
                        'Fitness Center',
                        'High-Speed Wi-Fi',
                        'Pet Friendly',
                        'EV Charging Station',
                        'Keyless / Biometric Entry',
                        'Rooftop Lounge',
                        'Spa & Sauna',
                        'Private Cinema / Theater Room',
                        'Valet Parking',
                        'Co-working Space / Business Center',
                        '24/7 Security System',
                        'Air Conditioning (A/C)',
                        'Kids Play Area',
                        'Intercom System',
                        '24/7 Compound Security',
                    ],
                    example: 'Fitness Center',
                },
                AmenityResponse: {
                    type: 'object',
                    description: 'An amenity record attached to a property',
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'Amenity ID', example: 'a1b2c3d4-...' },
                        name: { $ref: '#/components/schemas/AmenityName' },
                    },
                },

                // ─── House Rules ──────────────────────────────────────────────────────────
                HouseRuleName: {
                    type: 'string',
                    description: 'Available house rule name — must exactly match one of the seeded values',
                    enum: [
                        'No Smoking',
                        'Pets Allowed',
                        'No Parties or Events',
                        'Quiet Hours (10 PM - 8 AM)',
                        'No Additional Guests',
                        'No Shoes Inside',
                        'Respect Neighbours',
                        'Children Welcome',
                        'No Cooking of Strong-Smelling Food',
                        'Recycling Required',
                        'No Open Flames / Candles',
                        'CCTV on Premises',
                    ],
                    example: 'No Smoking',
                },
                HouseRuleResponse: {
                    type: 'object',
                    description: 'A house rule record attached to a property',
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'House rule ID', example: 'h1i2j3k4-...' },
                        name: { $ref: '#/components/schemas/HouseRuleName' },
                    },
                },

                // ─── Property Images ──────────────────────────────────────────────────────
                PropertyImage: {
                    type: 'object',
                    description: 'A property image record returned in responses',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        propertyId: { type: 'string', format: 'uuid' },
                        imageUrl: { type: 'string', format: 'uri', example: 'https://example.com/image1.jpg' },
                        isMain: { type: 'boolean', description: 'Whether this is the primary/cover image of the property', example: true },
                    },
                },
                PropertyImageInput: {
                    type: 'object',
                    required: ['image_url'],
                    description: 'Image object used in create/update requests',
                    properties: {
                        image_url: {
                            type: 'string',
                            format: 'uri',
                            maxLength: 500,
                            description: 'Public URL to the property image',
                            example: 'https://example.com/property-image.jpg',
                        },
                        is_main: {
                            type: 'boolean',
                            default: false,
                            description: 'Mark this image as the main cover photo. Only one image per property can be main.',
                            example: true,
                        },
                    },
                },

                // ─── Property Specifications ──────────────────────────────────────────────
                PropertySpecificationsInput: {
                    type: 'object',
                    required: ['bedrooms', 'bathrooms', 'floor', 'area_sqft', 'detailed_location'],
                    description: 'Physical specifications of the property unit',
                    properties: {
                        bedrooms: {
                            type: 'integer',
                            minimum: 0,
                            description: 'Number of bedrooms. Use 0 for studios.',
                            example: 2,
                        },
                        bathrooms: {
                            type: 'integer',
                            minimum: 0,
                            description: 'Number of bathrooms',
                            example: 2,
                        },
                        floor: {
                            type: 'integer',
                            description: 'Floor number (0 = ground floor, negative for basement)',
                            example: 5,
                        },
                        parking_spaces: {
                            type: 'integer',
                            minimum: 0,
                            default: 0,
                            description: 'Number of dedicated parking spaces',
                            example: 1,
                        },
                        area_sqft: {
                            type: 'number',
                            format: 'double',
                            minimum: 0.01,
                            description: 'Total area of the property in square feet',
                            example: 1200,
                        },
                        detailed_location: {
                            type: 'string',
                            minLength: 1,
                            description: 'Human-readable detailed location (building name, tower, apartment number, etc.)',
                            example: 'Building 3, Floor 5, Apartment 12, Downtown Cairo',
                        },
                    },
                },
                PropertySpecificationsResponse: {
                    type: 'object',
                    description: 'Physical specifications of the property as returned in the API response',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        bedrooms: { type: 'integer', example: 2 },
                        bathrooms: { type: 'integer', example: 2 },
                        floor: { type: 'integer', example: 5 },
                        parkingSpaces: { type: 'integer', example: 1 },
                        areaSqft: { type: 'number', format: 'double', example: 1200 },
                        detailedLocation: { type: 'string', example: 'Building 3, Floor 5, Apartment 12, Downtown Cairo' },
                    },
                },

                // ─── Property Response ────────────────────────────────────────────────────
                PropertyResponse: {
                    type: 'object',
                    description: 'Full property object returned by the API',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Unique property ID',
                            example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                        },
                        landlordId: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID of the landlord that owns this property',
                        },
                        title: {
                            type: 'string',
                            description: 'Property listing title',
                            example: 'Beautiful 2BR Apartment in Downtown Cairo',
                        },
                        description: {
                            type: 'string',
                            description: 'Full description of the property',
                            example: 'Spacious apartment with modern amenities in downtown',
                        },
                        monthlyPrice: {
                            type: 'number',
                            format: 'double',
                            description: 'Monthly rent price in EGP',
                            example: 1500.00,
                        },
                        securityDeposit: {
                            type: 'number',
                            format: 'double',
                            description: 'Refundable security deposit amount in EGP',
                            example: 3000.00,
                        },
                        address: {
                            type: 'string',
                            description: 'Full street address of the property',
                            example: '123 Main Street, Cairo, Egypt',
                        },
                        locationLat: {
                            type: 'number',
                            format: 'float',
                            description: 'GPS latitude coordinate',
                            example: 30.0444,
                        },
                        locationLong: {
                            type: 'number',
                            format: 'float',
                            description: 'GPS longitude coordinate',
                            example: 31.2357,
                        },
                        type: {
                            allOf: [{ $ref: '#/components/schemas/PropertyType' }],
                            nullable: true,
                            description: 'Type of property unit. null if not specified.',
                        },
                        furnishing: {
                            allOf: [{ $ref: '#/components/schemas/FurnishingStatus' }],
                            nullable: true,
                            description: 'Furnishing level of the property. null if not specified.',
                        },
                        status: {
                            $ref: '#/components/schemas/PropertyStatus',
                        },
                        targetTenant: {
                            $ref: '#/components/schemas/TargetTenant',
                        },
                        availabilityDate: {
                            type: 'string',
                            format: 'date',
                            nullable: true,
                            description: 'Date from which the property is available for rent (YYYY-MM-DD)',
                            example: '2026-03-01',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Timestamp when the property was created',
                        },
                        images: {
                            type: 'array',
                            description: 'List of all images for this property',
                            items: { $ref: '#/components/schemas/PropertyImage' },
                        },
                        amenities: {
                            type: 'array',
                            description: 'List of amenities attached to this property',
                            items: { $ref: '#/components/schemas/AmenityResponse' },
                        },
                        houseRules: {
                            type: 'array',
                            description: 'List of house rules that apply to this property',
                            items: { $ref: '#/components/schemas/HouseRuleResponse' },
                        },
                        specifications: {
                            allOf: [{ $ref: '#/components/schemas/PropertySpecificationsResponse' }],
                            nullable: true,
                            description: 'Physical specifications of the property. null if not yet provided.',
                        },
                    },
                },

                // ─── Create Property Request ──────────────────────────────────────────────
                CreatePropertyRequest: {
                    type: 'object',
                    required: [
                        'title',
                        'description',
                        'monthly_price',
                        'security_deposit',
                        'address',
                        'location_lat',
                        'location_long',
                        'furnishing',
                        'availability_date',
                        'images',
                        'specifications',
                    ],
                    description: 'Payload to create a new property listing. Requires landlord JWT token.',
                    properties: {
                        title: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 255,
                            description: 'Short descriptive title for the listing',
                            example: 'Beautiful 2BR Apartment in Downtown Cairo',
                        },
                        description: {
                            type: 'string',
                            minLength: 1,
                            description: 'Detailed description of the property, neighbourhood, and features',
                            example: 'Spacious apartment with modern amenities in downtown. Close to metro and shopping malls.',
                        },
                        monthly_price: {
                            type: 'number',
                            format: 'double',
                            minimum: 0.01,
                            maximum: 999999999.99,
                            description: 'Monthly rent price in EGP',
                            example: 1500.00,
                        },
                        security_deposit: {
                            type: 'number',
                            format: 'double',
                            minimum: 0,
                            maximum: 999999999.99,
                            description: 'Refundable security deposit in EGP (can be 0)',
                            example: 3000.00,
                        },
                        address: {
                            type: 'string',
                            minLength: 1,
                            description: 'Full street address',
                            example: '123 Main Street, Cairo, Egypt',
                        },
                        location_lat: {
                            type: 'number',
                            format: 'float',
                            minimum: -90,
                            maximum: 90,
                            description: 'GPS latitude. Must be between -90 and 90.',
                            example: 30.0444,
                        },
                        location_long: {
                            type: 'number',
                            format: 'float',
                            minimum: -180,
                            maximum: 180,
                            description: 'GPS longitude. Must be between -180 and 180.',
                            example: 31.2357,
                        },
                        type: {
                            $ref: '#/components/schemas/PropertyType',
                            description: 'Type of property unit (optional)',
                        },
                        furnishing: {
                            $ref: '#/components/schemas/FurnishingStatus',
                        },
                        target_tenant: {
                            $ref: '#/components/schemas/TargetTenant',
                            description: 'Preferred tenant type (optional, defaults to ANY)',
                        },
                        availability_date: {
                            type: 'string',
                            format: 'date',
                            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                            description: 'Date the property becomes available for rent (YYYY-MM-DD format)',
                            example: '2026-03-01',
                        },
                        images: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/PropertyImageInput' },
                            minItems: 1,
                            description: 'At least one image is required. Only one image can have `is_main: true`.',
                        },
                        amenity_names: {
                            type: 'array',
                            description: 'List of amenity names to attach. Each value must exactly match a seeded amenity name. Omit or pass [] for no amenities.',
                            items: { $ref: '#/components/schemas/AmenityName' },
                            example: ['Fitness Center', 'High-Speed Wi-Fi'],
                            default: [],
                        },
                        house_rule_names: {
                            type: 'array',
                            description: 'List of house rule names to attach. Each value must exactly match a seeded house rule name. Omit or pass [] for no house rules.',
                            items: { $ref: '#/components/schemas/HouseRuleName' },
                            example: ['No Smoking', 'Pets Allowed'],
                            default: [],
                        },
                        specifications: {
                            $ref: '#/components/schemas/PropertySpecificationsInput',
                        },
                    },
                },

                // ─── Update Property Request ──────────────────────────────────────────────
                UpdatePropertyRequest: {
                    type: 'object',
                    description: 'All fields are optional — only provided fields will be updated. Requires landlord JWT token and ownership of the property.',
                    properties: {
                        title: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 255,
                            description: 'New listing title',
                            example: 'Updated 2BR Apartment – Now Pet Friendly',
                        },
                        description: {
                            type: 'string',
                            minLength: 1,
                            description: 'New listing description',
                            example: 'Updated description with newly added amenities and renovated kitchen.',
                        },
                        monthly_price: {
                            type: 'number',
                            format: 'double',
                            minimum: 0.01,
                            maximum: 999999999.99,
                            description: 'New monthly price in EGP',
                            example: 1600.00,
                        },
                        security_deposit: {
                            type: 'number',
                            format: 'double',
                            minimum: 0,
                            maximum: 999999999.99,
                            description: 'New security deposit amount in EGP',
                            example: 3200.00,
                        },
                        address: {
                            type: 'string',
                            minLength: 1,
                            description: 'Updated full address',
                            example: '456 Nile Street, Giza, Egypt',
                        },
                        location_lat: {
                            type: 'number',
                            format: 'float',
                            minimum: -90,
                            maximum: 90,
                            description: 'Updated GPS latitude',
                            example: 30.0131,
                        },
                        location_long: {
                            type: 'number',
                            format: 'float',
                            minimum: -180,
                            maximum: 180,
                            description: 'Updated GPS longitude',
                            example: 31.2089,
                        },
                        type: {
                            $ref: '#/components/schemas/PropertyType',
                            description: 'Updated property type',
                        },
                        furnishing: {
                            $ref: '#/components/schemas/FurnishingStatus',
                            description: 'Updated furnishing status',
                        },
                        status: {
                            $ref: '#/components/schemas/PropertyStatus',
                            description: 'Updated listing status (e.g. publish the property by setting to **Published**)',
                        },
                        target_tenant: {
                            $ref: '#/components/schemas/TargetTenant',
                            description: 'Updated preferred tenant type',
                        },
                        availability_date: {
                            type: 'string',
                            format: 'date',
                            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                            description: 'Updated availability date (YYYY-MM-DD)',
                            example: '2026-04-01',
                        },
                        images: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/PropertyImageInput' },
                            minItems: 1,
                            description: '**Replace all** existing images with this new set. Omit to leave images unchanged.',
                        },
                        amenity_names: {
                            type: 'array',
                            description: '**Replace all** amenities with this new list. Pass `[]` to remove all amenities. Omit to leave amenities unchanged.',
                            items: { $ref: '#/components/schemas/AmenityName' },
                            example: ['Rooftop Lounge', 'Pet Friendly'],
                        },
                        house_rule_names: {
                            type: 'array',
                            description: '**Replace all** house rules with this new list. Pass `[]` to remove all house rules. Omit to leave house rules unchanged.',
                            items: { $ref: '#/components/schemas/HouseRuleName' },
                            example: ['No Smoking', 'No Parties or Events'],
                        },
                        specifications: {
                            allOf: [
                                {
                                    type: 'object',
                                    description: 'Partial update of property specifications. Only provided fields will be updated.',
                                    properties: {
                                        bedrooms: { type: 'integer', minimum: 0, example: 3 },
                                        bathrooms: { type: 'integer', minimum: 0, example: 2 },
                                        floor: { type: 'integer', example: 6 },
                                        parking_spaces: { type: 'integer', minimum: 0, example: 2 },
                                        area_sqft: { type: 'number', format: 'double', minimum: 0.01, example: 1350 },
                                        detailed_location: { type: 'string', minLength: 1, example: 'Tower B, Floor 6, Unit 601' },
                                    },
                                },
                            ],
                        },
                    },
                },

            },
        },
        tags: [
            {
                name: 'Health',
                description: 'Server health check endpoints',
            },
            {
                name: 'Authentication',
                description: 'User authentication and registration endpoints',
            },
            {
                name: 'Properties',
                description: 'Property listing management endpoints — create, read, update, delete.',
            },
        ],
    },
    apis: ['./src/modules/**/routes/*.ts', './src/index.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
