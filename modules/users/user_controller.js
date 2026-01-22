const User = require('../auth/auth_model')
const { GenerateToken } = require('../../utils/jwt_service')


/* User Currently logged in */
exports.current_user = async (req, res) => {
    try{
        const { email, id }= req.user;

        const response = await User.findOne({ email }).select('username email _id rating')
        return res.status(200).json({ message: "User details fetched successfully", response })
    }
    catch(err){
        return res.status(400).json({ error: err});
    }
}


/*  User details update  */
exports.update = async (req, res) => {
    try{
        const _id = req.user._id;

        // TODO -> Add more fields if needed
        const allowed_updates = ['username', 'email'];
        const updates = {};

        allowed_updates.forEach((field) => {
            if(req.body[field] !== undefined){
                updates[field] = req.body[field];
            }
        });

        const response = await User.findByIdAndUpdate( _id, { $set: updates }, { new: true, runValidators: true });
        if(!response) return res.status(404).json({ error: "Error updating the user details"})
        
        if(updates.email){
            const token = GenerateToken({ email: response.email, _id: response._id });
            res.cookie('token', token, {
                httpOnly: true,
                // TODO -> Make this uncomment for production ready 
                // secure: true,
                sameSite: 'strict',
                maxAge: 900000
            });
        }

        return res.status(200).json({ message: "User details updated successfully"});
    }
    catch(err){
        return res.status(400).json({ error: err});
    }
}


/*  Public User info  */
exports.user_info = async(req, res) => {
    try{
        const username = req.params.username;
        if(!username) return res.status(404).json({ error: "Username is empty"});

        const response = await User.findOne({ username }).select("_id username email rating");
        if(!response) return res.status(404).json({ error: "User not found" });

        return res.status(200).json({ message: "User fetched successfully", response});
    }
    catch(err){
        return res.status(400).json({ error: err});
    }
}


// TODO -> Add a route to get only the stats of user in future