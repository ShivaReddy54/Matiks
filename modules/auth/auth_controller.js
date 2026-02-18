const bcrypt = require('bcrypt');
const User = require('./auth_model.js');
const { GenerateToken, ValidateToken } = require('../../utils/jwt_service.js');
const { authCookieOptions, clearCookieOptions } = require('../../utils/cookie_options.js');


/*  Auth User Creation */
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ error: 'Please include all fields' });

        const salt = await bcrypt.genSalt(10);
        const hashed_password = await bcrypt.hash(password, salt);

        const response = await User.create({
            username,
            email,
            password: hashed_password,
            rating: 1000
        });

        if (!response) return res.status(400).json({ error: 'Error registering the user' });
        return res.status(201).json({ message: 'User successfully registered' });
    } catch (err) {
        return res.status(err.name === 'ValidationError' ? 400 : 500).json({ error: err.message || err });
    }
};


/* Auth User Login */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Please include all fields' });

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = GenerateToken({ email: user.email, _id: user._id });
        res.cookie('token', token, authCookieOptions());
        return res.status(200).json({ message: 'User successfully logged in', token });
    } catch (err) {
        return res.status(500).json({ error: err.message || err });
    }
};


/* Auth User Logout */
exports.logout = async (req, res) => {
    try {
        res.clearCookie('token', clearCookieOptions());
        return res.status(200).json({ message: 'User successfully logged out' });
    } catch (err) {
        return res.status(500).json({ error: err.message || err });
    }
};


/*  Auth Forget Password – returns reset token & link (send link via email in production) */
exports.forget_password = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Please include email' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const token = GenerateToken({ email: user.email, _id: user._id });
        const resetLink = process.env.CLIENT_URL
            ? `${process.env.CLIENT_URL}/reset-password?token=${token}`
            : null;

        return res.status(200).json({
            message: 'Reset token generated',
            resetLink,
            token: process.env.NODE_ENV !== 'production' ? token : undefined
        });
    } catch (err) {
        return res.status(500).json({ error: err.message || err });
    }
};


/*  Auth Reset Password – token-based (no auth required) */
exports.reset_password = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ error: 'Token and password required' });

        const decoded = ValidateToken(token);
        if (!decoded || !decoded.email) return res.status(400).json({ error: 'Invalid or expired token' });

        const salt = await bcrypt.genSalt(10);
        const hashed_password = await bcrypt.hash(password, salt);

        const response = await User.findOneAndUpdate(
            { email: decoded.email },
            { $set: { password: hashed_password } },
            { new: true, runValidators: true }
        );
        if (!response) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json({ message: 'Password successfully updated' });
    } catch (err) {
        if (err.message === 'Invalid or Expired Token') {
            return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: err.message || err });
    }
};
