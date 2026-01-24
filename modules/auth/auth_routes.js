const express = require('express')
const auth_router = express()
const auth_controller = require('./auth_controller')
const authenticate = require('../../midddlewares/auth_Middleware');


auth_router.post('/register', auth_controller.register);
auth_router.post('/login', auth_controller.login);
auth_router.post('/logout', authenticate, auth_controller.logout);
auth_router.post('/forget-password', auth_controller.forget_password);
auth_router.post('/reset-password', authenticate, auth_controller.reset_password);

module.exports = auth_router;