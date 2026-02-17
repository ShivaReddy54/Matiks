const Match = require('./match_model');
const { ValidateToken }= require('../../utils/jwt_service');


/* Create Match  */
exports.create_match = async (req, res) => {
    try{
        const { opponentId } = req.body;
        if(!opponentId) return res.status(400).json({ error: "Please include all the fields"});
        const playerId = req.user._id;
        if(playerId === opponentId) return res.status(400).json({ error: "You cant play against yourself"});
        const active_match = await Match.findOne({
            $or: [ {player1: playerId}, {player1: opponentId}, {player2: playerId}, {player2: opponentId} ],
            status: { $in: ['WAITING', 'ONGOING'] }
        });

        if(active_match) return res.status(400).json({ error: "One of the player is already in match" });
        const match = new Match({
            player1: playerId,
            player2: opponentId,
        });

        const response = await match.save();
        if(!response) return res.status(400).json({ error: "Failed to createa match"});
        return res.status(201).json({ message: "Match successfully created", response });
    }
    catch(err){
        return res.status(400).json({ error: err});
    }
}


/* Start Match  */
exports.start_match = async (req, res) => {
    try{
        const match_id = req.params.id;
        if(!match_id) return res.status(400).json({ error: "Please include match id"});

        const response = await Match.findByIdAndUpdate(match_id,
            { status: 'ONGOING', startTime: new Date() },
            { new: true }
        );

        if(!response) return res.status(400).json({ error: "Failed to start the match"});
        return res.status(200).json({ message: "Match successfully started"});
    }
    catch(err){
        return res.status(400).json({ error: err});
    }
}


/* End Match  */
exports.end_match = async (req, res) => {
    try{
        const match_id = req.params.id;
        const { winner_id } = req.body;
        if(!match_id || !winner_id) return res.status(400).json({ error: "Please include all fields"});

        const match = await Match.findById(match_id);
        if(!match) return res.status(400).json({ error: "Match not found"});
        if(match.status !== 'ONGOING') return res.status(400).json({ error: `Can not end a match with status: ${match.status}`});

        if(match.player1.toString() !== winner_id && match.player2.toString() !== winner_id)
            return res.status(400).json({ error: "Winner must be one of the player"});

        const response = await Match.findByIdAndUpdate(match_id,
            { 
                status: "COMPLETED",
                endTime: new Date(),
                winner: winner_id
            },
            { new: true }
        );

        if(!response) return res.status(400).json({ error: "Something went wrong"});
        return res.status(200).json({ message: "Thanks for playing the game", response});
    }
    catch(err){
        return res.status(500).json({ error: err});
    }
}


/* Get Match by ID */
exports.get_match_by_id = async (req, res) => {
    try{
        const match_id  = req.params.id;
        if(!match_id) return res.status(400).json({ error: "Please include all fields"});

        const response = await Match.findById(match_id).populate('player1 player2 status winner', 'username rating');
        if(!response) return res.status(400).json({ error: "No match found"});

        const participation = response.player1._id.toString() === req.user._id || response.player2._id.toString() === req.user._id;
        if(!participation) return res.status(403).json({ error: "Not Authorized to view this"});

        return res.status(200).json({ message: "Successfully fetched match details", response});
    }
    catch(err){
        return res.status(500).json({ error: err});
    }
}


/* Get User Matches  */
exports.get_user_matches = async (req, res) => {
    try{
        const user = req.params.id;
        if(!user) return res.status(400).json({ error: "Please include all fields"});
        if(user !== req.user._id) return res.status(403).json({ error: "Not Authorized to view this" });

        const response = await Match.find({
            $or: [{ player1: user }, { player2: user }],
        })
        .sort({ createdAt: -1 })
        .populate('player1', 'username email')
        .populate('player2', 'username email')
        .lean();


        if(!response) return res.status(400).json({ error: "No matches found"});
        return res.status(200).json({ message: "Successfully fetched user matches", response});
    }
    catch(err){
        return res.status(500).json({ error: err});
    }
}


/* Get Active Matches  */
exports.get_active_matches = async (req, res) => {
    try{
        const user = req.user._id;
        const response = await Match.findOne({
            $or: [{ player1: user}, { player2: user}],
            status: { $in: ['WAITING', 'ONGOING'] }
        }).populate('player1',  'username email')
        .populate('player2', 'username email')
        .lean();

        if(!response) return res.status(400).json({ error: "No active matches found" });
        return res.status(200).json({ message: "Successfully fetched user active matches", response});
    }
    catch(err){
        return res.status(500).json({ error: err});
    }
}