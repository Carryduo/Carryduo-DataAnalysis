const MatchId = require("../../schemas/matchId")
const MatchData = require("../../schemas/matchData")
const ChampInfo = require("../../schemas/champInfo")
exports.getMatchId = async () => {
    return await MatchId.find({}, { _id: false, matchId: true })
}

exports.getMatchData = async () => {
    return await MatchData.find({}, { _id: false, data: true })
}

exports.getMatchDataCnt = async () => {
    return await MatchData.find({}, { _id: false, data: true }).count()
}

exports.saveMatchData = async (data) => {
    return await MatchData.create({ data })
}

exports.getChampBanCnt = async (id) => {
    return await ChampInfo.findOne({ id }, { _id: false, ban: true })
}

exports.getChampInfo = async (id) => {
    return ChampInfo.findOne({ id })
}

exports.saveChampInfo = async (id, name, win, game) => {
    return ChampInfo.create({ id, name, win, game })
}

exports.addWinCnt = async (id, winCnt) => {
    return ChampInfo.updateOne({ id }, { $set: { win: winCnt + 1 } })
}
exports.addGameCnt = async (id, gameCnt) => {
    return ChampInfo.updateOne({ id }, { $set: { game: gameCnt + 1 } })
}
exports.addbanCnt = async (id, banCnt) => {
    return ChampInfo.updateOne({ id }, { $set: { ban: banCnt + 1 } })
}
