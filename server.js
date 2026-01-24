const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const Connect_Database  = require('./utils/connections.js');
const auth_router  = require('./modules/auth/auth_routes.js');
const user_router = require('./modules/users/user_routes.js');
const match_router = require('./modules/match/match_routes.js');
const app = express();


// Middlewares
app.use(express.json());
app.use(cookieParser())

// Mount Routes
app.use('/api/auth', auth_router);
app.use('/api/user', user_router);
app.use('/api/match', match_router);


// TODO -> Update the error codes of catch block to 500

const port = process.env.PORT || 3000
const Server = async () => {
    try{
        await Connect_Database()

        const port = process.env.PORT || 3001
        app.listen(port, () => {
            console.log(`Server Started at port ${port}`)
        })
    }catch(err){
        console.log(`Error starting the server`)
    }
}

Server();