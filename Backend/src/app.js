import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express()

// ===========================================
// SECURITY & PERFORMANCE MIDDLEWARE
// ===========================================

// Security headers (XSS protection, content sniffing prevention, etc.)
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
}));

// Gzip compression - reduces response size by ~70%
app.use(compression({
    level: 6, // Balanced compression level
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));

// Rate limiting - prevent abuse (100 requests per 15 minutes per IP)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit in dev
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/api/health', // Skip health checks
});
app.use('/api', limiter);

// Stricter rate limit for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 20 : 100,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
    },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ===========================================
// CORS & BODY PARSING
// ===========================================

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))
app.use(express.json({
    limit: '10mb',
}))
app.use(express.urlencoded({
    extended: true,
    limit: '10mb',
}))

// ===========================================
// STATIC FILES & CACHING
// ===========================================

// Static files with caching headers
app.use(express.static('public', {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
    etag: true,
    lastModified: true,
}));

app.use(cookieParser())

// ===========================================
// CACHE HEADERS MIDDLEWARE
// ===========================================

// Add cache headers for GET requests
app.use((req, res, next) => {
    if (req.method === 'GET') {
        // Cache product listings for 5 minutes
        if (req.path.includes('/products') && !req.path.includes('/admin')) {
            res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
        }
        // Cache categories for 1 hour
        else if (req.path.includes('/categories') || req.path.includes('/brands')) {
            res.set('Cache-Control', 'public, max-age=3600'); // 1 hour
        }
        // No cache for user-specific data
        else if (req.path.includes('/cart') || req.path.includes('/orders') || req.path.includes('/auth')) {
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        }
    }
    next();
});

// Health check endpoint (for load balancers/monitoring)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

//route import
import routes from './routes/index.routes.js';
import { graphqlMiddleware } from './graphql/index.js';

//route declaration
app.use('/graphql', graphqlMiddleware)
app.use('/api', routes)

// centralized error handler (returns JSON instead of crashing/HTML)
app.use(errorHandler);

export default app;
