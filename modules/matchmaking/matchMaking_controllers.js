const mongoose = require('mongoose');
const Match = require('../match/match_model');

/* In-memory queue: stores user IDs as strings for consistent comparison */
let waiting_room = [];


/*  Join matchmaking queue – if opponent available, create and start match immediately */
exports.join_queue = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) return res.status(400).json({ error: 'Please include all fields' });

        const userIdStr = userId.toString();

        const active_match = await Match.findOne({
            $or: [{ player1: userId }, { player2: userId }],
            status: { $in: ['WAITING', 'ONGOING'] }
        })
            .populate('player1', 'username rating')
            .populate('player2', 'username rating')
            .lean();

        if (active_match) {
            return res.status(200).json({
                status: 'MATCHED',
                message: 'You have an active match',
                matchId: active_match._id,
                match: active_match
            });
        }

        if (waiting_room.includes(userIdStr)) {
            return res.status(400).json({ error: 'Already in queue' });
        }

        /* Opponent found – create match and start it */
        if (waiting_room.length > 0) {
            const opponentIdStr = waiting_room.shift();
            const opponentId = new mongoose.Types.ObjectId(opponentIdStr);

            const match = new Match({
                player1: opponentId,
                player2: userId,
                status: 'ONGOING',
                startTime: new Date()
            });

            const saved = await match.save();
            if (!saved) return res.status(500).json({ error: 'Error creating match' });

            const response = await Match.findById(saved._id)
                .populate('player1', 'username rating')
                .populate('player2', 'username rating')
                .lean();

            return res.status(201).json({
                status: 'MATCHED',
                message: 'Match found',
                matchId: saved._id,
                match: response
            });
        }

        waiting_room.push(userIdStr);
        return res.status(200).json({
            status: 'QUEUED',
            message: 'Waiting for opponent'
        });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
};


/*  Leave queue or abandon active match – opponent wins by forfeit */
exports.leave_queue = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) return res.status(400).json({ error: 'Please include all fields' });

        const userIdStr = userId.toString();

        /* 1. Remove from queue if waiting */
        waiting_room = waiting_room.filter((id) => id !== userIdStr);

        /* 2. If in active match – end it, opponent wins by forfeit */
        const active_match = await Match.findOne({
            $or: [{ player1: userId }, { player2: userId }],
            status: { $in: ['WAITING', 'ONGOING'] }
        });

        if (active_match) {
            const opponentId = active_match.player1.equals(userId)
                ? active_match.player2
                : active_match.player1;

            await Match.findByIdAndUpdate(active_match._id, {
                status: 'COMPLETED',
                endTime: new Date(),
                winner: opponentId
            });
            return res.status(200).json({
                message: 'Left match – opponent wins by forfeit',
                matchEnded: true
            });
        }

        return res.status(200).json({ message: 'Left queue' });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
};


/*  Get current matchmaking / match status */
exports.get_status = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) return res.status(400).json({ error: 'Please include all fields' });

        const userIdStr = userId.toString();

        if (waiting_room.includes(userIdStr)) {
            return res.status(200).json({
                status: 'QUEUED',
                message: 'Waiting for opponent'
            });
        }

        const active_match = await Match.findOne({
            $or: [{ player1: userId }, { player2: userId }],
            status: { $in: ['WAITING', 'ONGOING'] }
        })
            .populate('player1', 'username rating')
            .populate('player2', 'username rating')
            .lean();

        if (active_match) {
            return res.status(200).json({
                status: 'MATCHED',
                message: 'Match in progress',
                matchId: active_match._id,
                match: active_match
            });
        }

        return res.status(200).json({
            status: 'IDLE',
            message: 'Not in queue, no active match'
        });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
};
