const express = require('express')
require('dotenv').config()
const Connect_Database  = require('./utils/connections.js')
const auth_router  = require('./modules/auth/auth_routes.js')
const app = express()


// Middlewares
app.use(express.json());


// Mount Routes
app.use('/api/auth', auth_router);


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