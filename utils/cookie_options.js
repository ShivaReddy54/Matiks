/**
 * Shared cookie options – secure in production, sameSite strict.
 */
const isProduction = process.env.NODE_ENV === 'production';

const defaultOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction
};

exports.cookieOptions = (overrides = {}) => ({
    ...defaultOptions,
    ...overrides
});

exports.authCookieOptions = (overrides = {}) => ({
    ...defaultOptions,
    maxAge: 900000, // 15 min
    ...overrides
});

/** Options for clearCookie – must match original cookie (path, domain, secure, sameSite) */
exports.clearCookieOptions = () => ({
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction
});
