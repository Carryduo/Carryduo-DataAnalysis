const { dataSource } = require('../../orm')
const MatchId = dataSource.getRepository('matchid')
const MatchData = dataSource.getRepository('matchdata')
const matchdata = require('../../entity/match.data')
const matchid = require('../../entity/match.id')

exports.getMatchId = async () => {
    return await MatchId.createQueryBuilder().select().where('matchid.analyzed = :analyzed', { analyzed: false }).getMany()
}

exports.getMatchData = async () => {
    return await MatchData.createQueryBuilder().select(['matchdata.matchData']).getMany()
}

exports.getMatchDataCnt = async () => {
    return await MatchData.find({}, { _id: false, data: true }).count()
}

exports.saveMatchData = async (matchData, tier, division, matchId) => {
    console.log(tier, division, matchId)
    let data
    let dbupdate
    // matchId 분석 완료 시, matchId 테이블에서 분석 상태값 변경
    await dataSource.transaction(async (transactionEntityManager) => {
        await transactionEntityManager.createQueryBuilder().insert().into(matchdata).values({
            matchData, tier, division, matchId
        }).execute()
            .then(() => {
                data = { code: 200, message: '정상' }
                return
            })
            .catch((error) => {
                console.log(error)
                if (error.errno === 1062) {
                    data = { code: 1062, message: '중복값 에러' }
                    return
                }
            })
        await transactionEntityManager.createQueryBuilder().update(matchid).set({ analyzed: true }).where('matchid.matchId = :matchId', { matchId }).execute()
            .then(() => {
                dbupdate = { message: 'matchId 분석 완료' }
                return
            })
            .catch((error) => {
                console.log(error)
                dbupdate = { message: 'matchId 분석 실패' }
                return
            })
    })
    return { data, dbupdate }
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
