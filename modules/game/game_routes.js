const express = require('express');
const game_router = express();
const game_controller = require('./game_controller.js');
const authenticate = require('../../midddlewares/auth_Middleware.js');


game_router.post('/start/:matchId', authenticate, game_controller.start_game);
game_router.post('/:gameId/answer', authenticate, game_controller.submit_answer);
game_router.get('/:gameId/state', authenticate, game_controller.get_state);
game_router.get('/:gameId/result', authenticate, game_controller.get_result);

module.exports = game_router;
