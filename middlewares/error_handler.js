/**
 * 404 handler – no route matched.
 */
const notFound = (req, res, next) => {
    res.status(404).json({ error: 'Route not found', path: req.originalUrl });
};

/**
 * Global error handler – catches errors from controllers and other middleware.
 */
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    res.status(status).json({ error: message });
};

module.exports = { notFound, errorHandler };
