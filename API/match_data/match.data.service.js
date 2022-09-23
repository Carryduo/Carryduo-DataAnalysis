const MatchId = require("../../schemas/matchId")
const MatchData = require("../../schemas/matchData")

exports.getMatchId = async () => {
    return await MatchId.find({}, { _id: false, matchId: true })
}

exports.getMatchData = async () => {
    return await MatchData.find({}, { _id: false, data: true })
}
exports.saveMatchData = async (data) => {
    return await MatchData.create({ data })
}

