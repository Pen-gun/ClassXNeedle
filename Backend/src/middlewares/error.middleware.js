import ApiError from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
    const statusCode = err instanceof ApiError ? err.statusCode : 500;
    const message = err?.message || 'Internal server error';
    const errors = err?.errors || [];

    // Provide stack only in development to avoid leaking details in prod
    const response = {
        success: false,
        message,
        errors,
        data: null
    };

    if (process.env.NODE_ENV === 'development' && err?.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};
