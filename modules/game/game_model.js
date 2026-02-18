const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
    {
        num1: { type: Number, required: true },
        num2: { type: Number, required: true },
        op: { type: String, enum: ['+', '-', '*'], required: true },
        correctAnswer: { type: Number, required: true }
    },
    { _id: false }
);

const gameSchema = new mongoose.Schema(
    {
        match: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match',
            required: true,
            unique: true
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
        questions: {
            type: [questionSchema],
            required: true
        },
        player1Score: { type: Number, default: 0 },
        player2Score: { type: Number, default: 0 },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        status: {
            type: String,
            enum: ['ACTIVE', 'COMPLETED'],
            default: 'ACTIVE',
            required: true
        },
        winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    { timestamps: true }
);

// gameSchema.index({ match: 1 });
// gameSchema.index({ status: 1 });

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;
