const User = require('../auth/auth_model');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;


/*  Get top users by rating – paginated, public */
exports.get_leaderboard = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find()
                .select('username rating')
                .sort({ rating: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments()
        ]);

        const leaderboard = users.map((user, idx) => ({
            rank: skip + idx + 1,
            username: user.username,
            rating: user.rating
        }));

        return res.status(200).json({
            message: 'Leaderboard fetched successfully',
            leaderboard,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
};


/*  Get current user's rank and surrounding context – authenticated */
exports.get_my_rank = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('username rating').lean();
        if (!user) return res.status(404).json({ error: 'User not found' });

        const rank = (await User.countDocuments({ rating: { $gt: user.rating } })) + 1;

        const aboveLimit = 2;
        const belowLimit = 2;
        const skip = Math.max(0, rank - 1 - aboveLimit);

        const surrounding = await User.find()
            .select('username rating')
            .sort({ rating: -1 })
            .skip(skip)
            .limit(aboveLimit + 1 + belowLimit)
            .lean();

        const leaderboard = surrounding.map((u, idx) => ({
            rank: skip + idx + 1,
            username: u.username,
            rating: u.rating,
            isMe: u._id.toString() === userId.toString()
        }));

        return res.status(200).json({
            message: 'Rank fetched successfully',
            rank,
            username: user.username,
            rating: user.rating,
            leaderboard
        });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
};
