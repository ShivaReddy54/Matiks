const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    // TODO -> Remove rating from here and store only user details in this schema

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 1000,
        min: 0
    }
},
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema)
module.exports = User;