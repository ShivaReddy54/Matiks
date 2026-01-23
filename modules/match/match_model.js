const mongoose = require('mongoose')

const matchSchema = new mongoose.Schema({

    status: {
        type: String,
        enum: ['WAITING', 'ONGOING', 'COMPLETED'],
        default: 'WAITING',
        required: true
    },
    player1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    player2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    }
},
{
    timestamps: true
});

matchSchema.index({ player1: 1 });
matchSchema.index({ player2: 1 });
matchSchema.index({ status: 1 });

const Match = mongoose.model('Match', matchSchema)
module.exports = Match;