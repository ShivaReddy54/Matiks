const express = require('express')
const user_router = express()
const user_controller = require('./user_controller')
const authenticate = require('../../midddlewares/auth_Middleware')

user_router.get('/me', authenticate, user_controller.current_user);
user_router.put('/me', authenticate, user_controller.update);
user_router.get("/:username", authenticate, user_controller.user_info);

module.exports = user_router;