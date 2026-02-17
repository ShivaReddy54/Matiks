const mongoose = require('mongoose')
const dns = require('dns')
dns.setServers(['1.1.1.1', '8.8.8.8']); // Use Cloudflare and Google DNS

async function Connect_Database(){
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL)
        console.log("Database connection is successful")
    }
    catch(err){
        console.log(`Error connecting the database ${err}`)
        process.exit(1)
    }
}

module.exports = Connect_Database