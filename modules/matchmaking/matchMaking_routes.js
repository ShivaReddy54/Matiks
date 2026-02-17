const express = require('express');
const matchMaking_router = express();
const matchMaking_controller = require('./matchMaking_controllers.js');
const authenticate = require('../../midddlewares/auth_Middleware.js');

matchMaking_router.post('/join', authenticate, matchMaking_controller.join_queue);
matchMaking_router.post('/leave', authenticate, matchMaking_controller.leave_queue);
matchMaking_router.get('/status', authenticate, matchMaking_controller.get_status);
matchMaking_router.get('/current', authenticate, matchMaking_controller.get_status); 

matchMaking_router.get('/health', (req, res) => res.status(200).send('OK'));

module.exports = matchMaking_router;
