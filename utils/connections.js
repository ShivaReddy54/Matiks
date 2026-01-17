const mongoose = require('mongoose')

async function Connect_Database(){
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL)
        console.log("Database connection is successful")
    }
    catch(err){
        console.log(`Error connecting the database ${err}`)
    }
}

module.exports = Connect_Database;