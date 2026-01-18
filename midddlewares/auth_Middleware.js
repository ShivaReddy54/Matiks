
const { ValidateToken } = require('../utils/jwt_service')

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if(!authHeader || !authHeader.startsWith('Bearer ')) 
        return res.status(401).json({ error: "Access Denied, No Token Provided" });

    const token = authHeader.split(' ')[1]; 

    try{
        const decoded = ValidateToken(token);
        req.user = decoded;

        next();
    }catch(err){
        return res.status(403).json({ error: "Invalid or Expired Token"});
    }
};

module.exports = authenticate;