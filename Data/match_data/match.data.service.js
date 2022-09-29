const { dataSource } = require('../../orm')
const MatchId = dataSource.getRepository('matchid')
const MatchData = dataSource.getRepository('matchdata')
const matchdata = require('../../entity/match.data')
const matchid = require('../../entity/match.id')
const queryRunner = dataSource.createQueryRunner()
const { Brackets } = require('typeorm')
const Combination = dataSource.getRepository('combination')
const combination = require('../../entity/combination.data')
const { query } = require('express')

exports.getMatchId = async () => {
    return await MatchId.createQueryBuilder().select().where(
        new Brackets((qb) => {
            qb.where('matchid.tier = :tier', {
                tier: 'PLATINUM',
            })
                .orWhere('matchid.tier = :tier2', {
                    tier2: 'DIAMOND'
                });


        })
    )
        // .andWhere('matchid.analyzed = :analyzed', {
        //     analyzed: false,
        // })
        .getMany()
}

exports.getMatchData = async () => {
    return await MatchData.createQueryBuilder().select(['matchdata.matchData', 'matchdata.id', 'matchdata.matchId']).
        where('matchdata.tier = :tier', { tier: 'DIAMOND' }).orWhere('matchdata.tier = :tier2', { tier2: 'PLATINUM' }).getMany()
}

exports.getMatchDataCnt = async () => {
    return await MatchData.find({}, { _id: false, data: true }).count()
}

exports.saveMatchData = async (matchData, tier, division, matchId) => {
    console.log(tier, division, matchId)
    await queryRunner.connect()
    await queryRunner.startTransaction()

    let data
    let dbupdate
    // matchId 분석 완료 시, matchId 테이블에서 분석 상태값 변경

    try {
        await queryRunner.manager.createQueryBuilder().insert().into(matchdata).values({
            matchData, tier, division, matchId
        }).execute()
            .then(() => {
                data = { code: 200, message: '정상' }
                return
            })

        await queryRunner.manager.createQueryBuilder().update(matchid).set({ analyzed: true }).where('matchid.matchId = :matchId', { matchId }).execute()
            .then(() => {
                dbupdate = { message: 'matchId 분석 완료' }
                return
            })
        await queryRunner.commitTransaction()
    } catch (error) {
        console.log(error)
        if (error.errno === 1062) {
            data = { code: 1062, message: '중복값 에러' }
        }

        dbupdate = { message: 'matchId 분석 실패' }
        await queryRunner.rollbackTransaction()
    } finally {
        return { data, dbupdate }
    }
}

exports.getData = async (type) => {
    return await Combination.createQueryBuilder().select().where('combination.category = :category', { category: type }).orderBy({ 'combination.sampleNum': 'DESC' }).limit(10).getMany()
}

exports.checkCombinationData = async (mainChamp, subChamp) => {
    return await Combination.createQueryBuilder().select().where('combination.mainChampId = :mainChampId', { mainChampId: mainChamp.champId }).andWhere('combination.subChampId = :subChampId', { subChampId: subChamp.champId }).getMany()
}

exports.updateCombinationData = async (id, matchId, mainChamp, subChamp, category) => {
    // TODO: 트랜젝션, matchId 업데이트
    console.log("update", mainChamp, subChamp)

    let dbupdate
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        if (category === "win") {
            await queryRunner.manager.createQueryBuilder().update(combination).set({
                win: () => "win + 1",
                sampleNum: () => "sampleNum + 1"
            })
                .where('combination.mainChampId = :mainChampId', { mainChampId: mainChamp.champId })
                .andWhere('combination.subChampId = :subChampId', { subChampId: subChamp.champId })
                .execute()
            await queryRunner.manager.createQueryBuilder().update(matchdata)
                .set({ analyzed: true })
                .where('matchdata.id = :id', { id }).execute()
                .then(() => {
                    dbupdate = { message: `${matchId} 분석 성공` }
                })
        } else {
            await queryRunner.manager.createQueryBuilder().update(combination).set({
                lose: () => "lose + 1",
                sampleNum: () => "sampleNum + 1"
            })
                .where('combination.mainChampId = :mainChampId', { mainChampId: mainChamp.champId })
                .andWhere('combination.subChampId = :subChampId', { subChampId: subChamp.champId })
                .execute()

            await queryRunner.manager.createQueryBuilder().update(matchdata)
                .set({ analyzed: true })
                .where('matchdata.id = :id', { id }).execute()
                .then(() => {
                    dbupdate = { message: `${matchId} 분석 성공` }
                })
        }

        await queryRunner.commitTransaction()
    } catch (error) {
        dbupdate = { message: `${matchId} 분석 실패` }
        console.log(error)
        await queryRunner.rollbackTransaction()
    } finally {
        return dbupdate
    }
}

exports.saveCombinationData = async (id, matchId, mainChamp, subChamp, category, type) => {
    console.log("save", mainChamp, subChamp, matchId)

    let dbupdate
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        if (category === "win") {
            await queryRunner.manager.createQueryBuilder().insert().into(combination).values({
                matchId,
                mainChampId: mainChamp.champId,
                mainChampName: mainChamp.champName,
                subChampId: subChamp.champId,
                subChampName: subChamp.champName,
                win: 1,
                lose: 0,
                sampleNum: 1,
                category: type,
            }).execute()
            await queryRunner.manager.createQueryBuilder().update(matchdata)
                .set({ analyzed: true })
                .where('matchdata.id = :id', { id }).execute()
                .then(() => {
                    dbupdate = { message: `${matchId} 분석 성공` }
                })
        } else {
            await queryRunner.manager.createQueryBuilder().insert().into(combination).values({
                matchId,
                mainChampId: mainChamp.champId,
                mainChampName: mainChamp.champName,
                subChampId: subChamp.champId,
                subChampName: subChamp.champName,
                win: 0,
                lose: 1,
                sampleNum: 1,
                category: type,
            }).execute()
            await queryRunner.manager.createQueryBuilder().update(matchdata)
                .set({ analyzed: true })
                .where('matchdata.id = :id', { id }).execute()
                .then(() => {
                    dbupdate = { message: `${matchId} 분석 성공` }
                })
        }
        await queryRunner.commitTransaction()
    } catch (error) {
        console.log(error)
        dbupdate = { message: `${matchId} 분석 실패` }
        await queryRunner.rollbackTransaction()
    } finally {
        return dbupdate
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

exports.disconnect = async () => {
    await queryRunner.release()
}
