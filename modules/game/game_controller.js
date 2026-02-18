const mongoose = require('mongoose');
const Game = require('./game_model');
const Match = require('../match/match_model');
const User = require('../auth/auth_model');
const { generateQuestions } = require('../../utils/question_generator');
const { calculateRatingChange } = require('../../utils/rating_service');

const GAME_DURATION_SECONDS = 60;
const QUESTIONS_COUNT = 30;


/* Strip correctAnswer from questions for client */
const toClientQuestions = (questions) =>
    questions.map(({ num1, num2, op }) => ({ num1, num2, op }));


/* Ensure user is a participant in the match */
const isParticipant = (match, userId) => {
    const uid = userId.toString();
    return match.player1.toString() === uid || match.player2.toString() === uid;
};


/* Start game for a match – creates game if not exists, returns state */
exports.start_game = async (req, res) => {
    try {
        const matchId = req.params.matchId;
        const userId = req.user._id;

        if (!matchId) return res.status(400).json({ error: 'Match ID required' });

        const match = await Match.findById(matchId).lean();
        if (!match) return res.status(404).json({ error: 'Match not found' });
        if (!isParticipant(match, userId)) return res.status(403).json({ error: 'Not a participant' });
        if (match.status !== 'ONGOING') return res.status(400).json({ error: 'Match is not active' });

        let game = await Game.findOne({ match: matchId })
            .populate('player1', 'username rating')
            .populate('player2', 'username rating');

        if (!game) {
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + GAME_DURATION_SECONDS * 1000);
            const questions = generateQuestions(QUESTIONS_COUNT);

            game = await Game.create({
                match: matchId,
                player1: match.player1,
                player2: match.player2,
                questions,
                startTime,
                endTime
            });

            game = await Game.findById(game._id)
                .populate('player1', 'username rating')
                .populate('player2', 'username rating')
                .lean();
        } else {
            game = game.toObject ? game.toObject() : game;
        }

        if (game.status === 'COMPLETED') {
            return res.status(200).json({
                status: 'COMPLETED',
                message: 'Game ended',
                gameId: game._id,
                player1Score: game.player1Score,
                player2Score: game.player2Score,
                winner: game.winner,
                questions: toClientQuestions(game.questions)
            });
        }

        return res.status(200).json({
            status: 'ACTIVE',
            gameId: game._id,
            matchId,
            player1: game.player1,
            player2: game.player2,
            player1Score: game.player1Score,
            player2Score: game.player2Score,
            startTime: game.startTime,
            endTime: game.endTime,
            questions: toClientQuestions(game.questions)
        });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
};


/* Submit answer for current question */
exports.submit_answer = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { questionIndex, answer } = req.body;
        const userId = req.user._id;

        if (!gameId || questionIndex === undefined || answer === undefined) {
            return res.status(400).json({ error: 'gameId, questionIndex and answer required' });
        }

        const game = await Game.findById(gameId);
        if (!game) return res.status(404).json({ error: 'Game not found' });
        if (!isParticipant({ player1: game.player1, player2: game.player2 }, userId)) {
            return res.status(403).json({ error: 'Not a participant' });
        }
        if (game.status === 'COMPLETED') {
            return res.status(400).json({ error: 'Game has ended' });
        }
        if (new Date() > game.endTime) {
            await finalizeGame(game);
            return res.status(400).json({ error: 'Time is up', gameEnded: true });
        }
        if (questionIndex < 0 || questionIndex >= game.questions.length) {
            return res.status(400).json({ error: 'Invalid question index' });
        }

        const q = game.questions[questionIndex];
        const correct = Number(answer) === q.correctAnswer;
        const isPlayer1 = game.player1.toString() === userId.toString();

        if (correct) {
            if (isPlayer1) game.player1Score += 1;
            else game.player2Score += 1;
            await game.save();
        }

        return res.status(200).json({
            correct,
            player1Score: game.player1Score,
            player2Score: game.player2Score
        });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
};


/* Get current game state (scores, time remaining) */
exports.get_state = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user._id;

        const game = await Game.findById(gameId)
            .populate('player1', 'username rating')
            .populate('player2', 'username rating')
            .lean();

        if (!game) return res.status(404).json({ error: 'Game not found' });
        if (!isParticipant(game, userId)) return res.status(403).json({ error: 'Not a participant' });

        const now = new Date();
        const isEnded = game.status === 'COMPLETED' || now > new Date(game.endTime);

        if (isEnded && game.status !== 'COMPLETED') {
            const gameDoc = await Game.findById(gameId);
            await finalizeGame(gameDoc);
            const updated = await Game.findById(gameId)
                .populate('player1', 'username rating')
                .populate('player2', 'username rating')
                .populate('winner', 'username')
                .lean();
            return res.status(200).json({
                status: 'COMPLETED',
                ...updated,
                questions: toClientQuestions(updated.questions)
            });
        }

        const timeRemainingSeconds = Math.max(0, Math.ceil((new Date(game.endTime) - now) / 1000));

        return res.status(200).json({
            status: game.status,
            gameId: game._id,
            player1: game.player1,
            player2: game.player2,
            player1Score: game.player1Score,
            player2Score: game.player2Score,
            startTime: game.startTime,
            endTime: game.endTime,
            timeRemainingSeconds,
            questions: toClientQuestions(game.questions)
        });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
};


/* Get final result – finalizes if needed, returns winner and rating changes */
exports.get_result = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user._id;

        const game = await Game.findById(gameId)
            .populate('player1', 'username rating')
            .populate('player2', 'username rating')
            .populate('winner', 'username')
            .lean();

        if (!game) return res.status(404).json({ error: 'Game not found' });
        if (!isParticipant(game, userId)) return res.status(403).json({ error: 'Not a participant' });

        const now = new Date();
        if (game.status !== 'COMPLETED' && now > new Date(game.endTime)) {
            const gameDoc = await Game.findById(gameId);
            await finalizeGame(gameDoc);
        }

        const result = await Game.findById(gameId)
            .populate('player1', 'username rating')
            .populate('player2', 'username rating')
            .populate('winner', 'username')
            .lean();

        return res.status(200).json({
            status: 'COMPLETED',
            gameId: result._id,
            matchId: result.match,
            player1: result.player1,
            player2: result.player2,
            player1Score: result.player1Score,
            player2Score: result.player2Score,
            winner: result.winner,
            questions: toClientQuestions(result.questions)
        });
    } catch (err) {
        return res.status(500).json({ error: err });
    }
};


/* Finalize game: determine winner, update Match, distribute ratings */
async function finalizeGame(game) {
    if (game.status === 'COMPLETED') return;

    const p1Score = game.player1Score;
    const p2Score = game.player2Score;

    let winner = null;
    if (p1Score > p2Score) winner = game.player1;
    else if (p2Score > p1Score) winner = game.player2;

    const [p1, p2] = await Promise.all([
        User.findById(game.player1),
        User.findById(game.player2)
    ]);
    if (!p1 || !p2) return;

    let p1RatingChange = 0;
    let p2RatingChange = 0;

    if (winner) {
        const winnerRating = p1._id.equals(winner) ? p1.rating : p2.rating;
        const loserRating = p1._id.equals(winner) ? p2.rating : p1.rating;
        const { winnerGain, loserLoss } = calculateRatingChange(winnerRating, loserRating);
        if (p1._id.equals(winner)) {
            p1RatingChange = winnerGain;
            p2RatingChange = -Math.abs(loserLoss);
        } else {
            p2RatingChange = winnerGain;
            p1RatingChange = -Math.abs(loserLoss);
        }
    }

    await Promise.all([
        Game.findByIdAndUpdate(game._id, {
            status: 'COMPLETED',
            winner,
            player1Score: p1Score,
            player2Score: p2Score
        }),
        Match.findByIdAndUpdate(game.match, {
            status: 'COMPLETED',
            endTime: new Date(),
            winner
        }),
        User.findByIdAndUpdate(game.player1, { $inc: { rating: p1RatingChange } }),
        User.findByIdAndUpdate(game.player2, { $inc: { rating: p2RatingChange } })
    ]);
}
