const express = require('express');
const match_router = express();
const match_controller = require('./match_controller');
const authenticate = require('../../midddlewares/auth_Middleware');

match_router.use(authenticate);


match_router.post('/', authenticate, match_controller.create_match);
match_router.get('/active', authenticate, match_controller.get_active_matches);
match_router.get('/:id', authenticate, match_controller.get_match_by_id);
match_router.get('/user/:id', authenticate, match_controller.get_user_matches);

// System routes
match_router.post('/:id/start', match_controller.start_match);
match_router.post('/:id/end', match_controller.end_match);


module.exports = match_router;