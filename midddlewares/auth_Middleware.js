
const { ValidateToken } = require('../utils/jwt_service')

const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try{
        const decoded = ValidateToken(token);
        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authenticate;