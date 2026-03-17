import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import swaggerSpec from './config/swagger.js';
import { AuthError } from './modules/auth/services/auth.service.js';
import { PropertyError } from './modules/properties/services/property.service.js';
import { RentalRequestError } from './modules/rental-requests/services/rental-request.service.js';
import { ContractError } from './modules/contracts/services/contract.service.js';

// Import routes
import authRoutes from './modules/auth/routes/auth.routes.js';
import propertyRoutes from './modules/properties/routes/property.routes.js';
import rentalRequestRoutes from './modules/rental-requests/routes/rental-request.routes.js';
import contractRoutes from './modules/contracts/routes/contract.routes.js';

// Import models to register them
import './modules/auth/models/index.js';
import './modules/properties/models/index.js';
import './modules/rental-requests/models/index.js';
import './modules/contracts/models/index.js';

// Create Express app
const app = express();

// ======================
// Security Middleware
// ======================
if (env.NODE_ENV === 'production') {
    app.use(helmet());
} else {
    app.use(helmet({ contentSecurityPolicy: false }));
}
app.use(cors({
    origin: env.NODE_ENV === 'production'
        ? ['https://homi.app']
        : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
}));

// ======================
// Body Parsing
// ======================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================
// API Documentation (Swagger UI)
// ======================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'HOMi API Documentation',
    swaggerOptions: {
        persistAuthorization: true,
    },
}));

app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// ======================
// Health Check
// ======================
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'HOMi API is running',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
    });
});

// ======================
// API Routes
// ======================
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rental-requests', rentalRequestRoutes);
app.use('/api/contracts', contractRoutes);

// ======================
// 404 Handler
// ======================
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Resource not found',
        code: 'NOT_FOUND',
    });
});

// ======================
// Global Error Handler
// ======================
interface ErrorResponse {
    success: false;
    message: string;
    code: string;
    stack?: string;
}

app.use((
    err: Error,
    _req: Request,
    res: Response<ErrorResponse>,
    _next: NextFunction
) => {
    console.error('❌ Error:', err);

    if (err instanceof AuthError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code,
        });
        return;
    }

    if (err instanceof PropertyError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code,
        });
        return;
    }

    if (err instanceof RentalRequestError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code,
        });
        return;
    }

    if (err instanceof ContractError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code,
        });
        return;
    }

    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({
            success: false,
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
        });
        return;
    }

    res.status(500).json({
        success: false,
        message: env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
        code: 'INTERNAL_ERROR',
        ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
});

export default app;
