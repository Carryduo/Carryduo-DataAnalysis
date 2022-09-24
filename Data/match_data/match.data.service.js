const MatchId = require("../../schemas/matchId")
const MatchData = require("../../schemas/matchData")
const ChampInfo = require("../../schemas/champInfo")
const Combination = require("../../schemas/combination.stat")

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

exports.getData = async (type) => {
    return await Combination.find({ type }).sort("-sampleNum").limit(5)
}

exports.checkCombinationData = async (mainChamp, subChamp) => {
    return await Combination.find({ mainChampId: mainChamp.champId, subChampId: subChamp.champId })
}

exports.updateCombinationData = async (mainChamp, subChamp, category) => {
    console.log("update", mainChamp, subChamp)
    const data = await Combination.findOne({ mainChampId: mainChamp.champId, subChampId: subChamp.champId })
    console.log(data)
    let { win, lose, sampleNum } = data
    if (category === "win") {
        win += 1
    } else {
        lose += 1
    }
    sampleNum += 1
    await Combination.updateOne(
        { mainChampId: mainChamp.champId, subChampId: subChamp.champId },
        {
            $set: {
                win,
                lose,
                sampleNum,
            },
        }
    )
}

exports.saveCombinationData = async (mainChamp, subChamp, category, type) => {
    console.log("save", mainChamp, subChamp)
    if (category === "win") {
        await Combination.create({
            mainChampId: mainChamp.champId,
            mainChampName: mainChamp.champName,
            subChampId: subChamp.champId,
            subChampName: subChamp.champName,
            win: 1,
            lose: 0,
            sampleNum: 1,
            type,
        })
    } else {
        await Combination.create({
            mainChampId: mainChamp.champId,
            mainChampName: mainChamp.champName,
            subChampId: subChamp.champId,
            subChampName: subChamp.champName,
            win: 0,
            lose: 1,
            sampleNum: 1,
            type,
        })
    }
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
