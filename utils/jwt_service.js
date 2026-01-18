const jwt = require('jsonwebtoken')

const secret = process.env.JWT_SECRET;

const GenerateToken = (payload) => {
    return jwt.sign(payload, secret, {
        expiresIn: "15m",
        algorithm: "HS256" // HMAX with SHA256 algo
    });
};


const ValidateToken = (token) => {
    try{
        return jwt.verify(token, secret);
    }catch(err){
        throw new Error("Invalid or Expired Token");
    }
};


module.exports = { GenerateToken, ValidateToken };