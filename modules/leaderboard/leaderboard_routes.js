const express = require('express');
const leaderboard_router = express();
const leaderboard_controller = require('./leaderboard_controller.js');
const authenticate = require('../../midddlewares/auth_Middleware.js');

leaderboard_router.get('/', authenticate, leaderboard_controller.get_leaderboard);
leaderboard_router.get('/me/rank', authenticate, leaderboard_controller.get_my_rank);

module.exports = leaderboard_router;
