/**
 * Elo rating distribution.
 * K = 32 (sensitivity), expected score = 1 / (1 + 10^((opponentRating - yourRating) / 400))
 */

const K_FACTOR = 32;

const getExpectedScore = (yourRating, opponentRating) => {
    return 1 / (1 + Math.pow(10, (opponentRating - yourRating) / 400));
};

exports.calculateRatingChange = (winnerRating, loserRating) => {
    const winnerExpected = getExpectedScore(winnerRating, loserRating);
    const loserExpected = getExpectedScore(loserRating, winnerRating);

    const winnerGain = Math.round(K_FACTOR * (1 - winnerExpected));
    const loserLoss = Math.round(K_FACTOR * (0 - loserExpected));

    return { winnerGain, loserLoss };
};


exports.calculateDrawRatingChange = (player1Rating, player2Rating) => {
    const p1Expected = getExpectedScore(player1Rating, player2Rating);
    const p2Expected = getExpectedScore(player2Rating, player1Rating);

    const player1Change = Math.round(K_FACTOR * (0.5 - p1Expected));
    const player2Change = Math.round(K_FACTOR * (0.5 - p2Expected));

    return { player1Change, player2Change };
};
