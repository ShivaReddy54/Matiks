const express = require('express');
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const Connect_Database = require('./utils/connections.js');
const { notFound, errorHandler } = require('./middlewares/error_handler.js');

const auth_router = require('./modules/auth/auth_routes.js');
const user_router = require('./modules/users/user_routes.js');
const match_router = require('./modules/match/match_routes.js');
const matchMaking_router = require('./modules/matchmaking/matchMaking_routes.js');
const game_router = require('./modules/game/game_routes.js');
const leaderboard_router = require('./modules/leaderboard/leaderboard_routes.js');

const app = express();

// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Routes
app.use('/api/auth', auth_router);
app.use('/api/user', user_router);
app.use('/api/match', match_router);
app.use('/api/matchmaking', matchMaking_router);
app.use('/api/game', game_router);
app.use('/api/leaderboard', leaderboard_router);

// 404 and error handler
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3001;

const Server = async () => {
    try {
        await Connect_Database();
        app.listen(port, () => {
            console.log(`Server started at port ${port}`);
        });
    } catch (err) {
        console.error('Error starting the server:', err);
        process.exit(1);
    }
};

Server();
