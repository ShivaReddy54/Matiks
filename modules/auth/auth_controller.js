const bcrypt = require('bcrypt')
const User = require('./auth_model.js')
const { GenerateToken, ValidateToken } = require('../../utils/jwt_service.js');


// TODO -> Add JWT

/*  Auth User Creation */
exports.register = async (req, res) => {
    try{
        const { username, email, password }  = req.body
        if(!username || !email || !password) return res.status(400).json({ error: "Please include all fields" })

        const salt = await bcrypt.genSalt(10);
        const hashed_password = await bcrypt.hash(password, salt);

        const response = await User.create({
            username,
            email,
            password: hashed_password,
            rating: 1000
        });

        if(!response) return res.status(400).json({ error: "Error Registering the User"});
        return res.status(201).json({ message: "User Successfully Registered"});

    }catch(err){
        return res.status(400).json({ error: err})
    }
}


/* Auth User Login  */
exports.login = async (req, res) => {
    try{
        const { email, password } = req.body;
        if(!email || !password ) return res.status(400).json({ error: "Please include all fields" });
        const user = await User.findOne({ email });
        if(!user || !(await bcrypt.compare(password, user.password))) 
            return res.status(400).json({ error: "User Not Found or Password not matched"});
        // TODO -> Add JWT here 
        const token = GenerateToken({ email: user.email, _id: user._id });
        return res.status(200).json({ message: "User successfully Logged in", token});
    }catch(err){
        return res.status(400).json({ error: err})
    }
}


/* Auth User Logout  */
exports.logout = async (req, res) => {
    // TODO -> Take Cookie and add it to redis and clear in Localstorage

    try{
        return res.status(200).json({ message: "User Successfully logged out"});
    }catch(err){
        return res.status(400).json({ error: err})
    }
}


/*  Auth Forget Password */
exports.forget_password = async (req, res) => {
    try{
        const { email } = req.body;
        if(!email) return res.status(400).json({ error: "Please include all fields"});

        const user = await User.findOne(email);
        if(!user) return res.status(404).json({ error: "User not Found"});

        // TODO -> send it through the email and hit reset-pass route
        const token = GenerateToken({ email: email, _id: user._id });
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`
        return res.status(200).json({ message: "Reset Token sent to mail", token, resetLink});
    }
    catch(err){
        return res.status(400).json({ error: err});
    }
}


/*  Auth Reset Password  */
exports.reset_password = async (req, res) => {
    try{
        const { email, password } = req.body;
        if(!email || !password) return res.status(400).json({ error: "Please include all the fields"});
        console.log("hi")
        // TODO -> Instead of email take the reset JWT and verify its expiry <-- DONE
        const salt = await bcrypt.genSalt(10);
        const hashed_password = await bcrypt.hash(password, salt);

        const response = await User.findOneAndUpdate({ email: email}, { $set: { password: hashed_password } }, { new: true, runValidators: true });
        if(!response) return res.status(404).json({ error: "Error resetting the user password"});
        return res.status(200).json({ message: "User password successfully updated"});
    }catch(err){
        return res.status(400).json({ error: err });
    }
}
