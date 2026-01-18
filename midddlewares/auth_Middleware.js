
const { ValidateToken } = require('../utils/jwt_service')

const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    if(!token) return res.status(404).json({ error: "No Token Provided" });

    try{
        const decoded = ValidateToken(token);
        req.user = decoded;

        next();
    }catch(err){
        return res.status(403).json({ error: "Invalid or Expired Token"});
    }
};

module.exports = authenticate;