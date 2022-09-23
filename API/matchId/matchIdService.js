const PuuId = require("../../schemas/puuId")
const MatchId = require("../../schemas/matchId")

exports.findPuuId = async () => {
    return await PuuId.find({}, { _id: false, puuId: true })
}
exports.saveMatchId = async (matchId) => {
    return await MatchId.create({ matchId })
}
