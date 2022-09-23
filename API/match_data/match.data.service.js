const MatchId = require("../../schemas/matchId")
const MatchData = require("../../schemas/matchData")

exports.getMatchId = async () => {
    return await MatchId.find({}, { _id: false, matchId: true })
}

exports.saveMatchData = async (data) => {
    return await MatchData.create({ data })
}

