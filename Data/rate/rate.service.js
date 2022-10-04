const { dataSource } = require("../../orm")
const ChampInfo = dataSource.getRepository("champinfo")
const ChampSpell = dataSource.getRepository("champspell")
const MatchData = dataSource.getRepository("matchdata")

const matchdata = require("../../entity/match.data")
const champspell = require("../../entity/champ.spell.data")
const champinfo = require("../../entity/champ.info.data")

const queryRunner = dataSource.createQueryRunner()

const { dataSource_service } = require("../../orm")
const Champ = dataSource_service.getRepository("CHAMP")

exports.getMatchData = async () => {
    return await MatchData.createQueryBuilder()
        .select(["matchData", "id", "matchId"])
        .where("tier = :tier", { tier: "DIAMOND" })
        .orWhere("tier = :tier2", { tier2: "PLATINUM" })
        .andWhere("rateAnalyzed = :result", { result: 0 })
        .andWhere("spellAnalyzed = :result", { result: 0 })
        .andWhere("banAnalyzed = :result", { result: 0 })
        .andWhere("positionAnalyzed = :result", { result: 0 })
        .getRawMany()
}

exports.saveChampId = async (champName, champId) => {
    return ChampInfo.createQueryBuilder()
        .insert()
        .values({
            champName,
            champId,
        })
        .execute()
        .then((value) => {
            return { code: 200, message: "정상" }
        })
        .catch((error) => {
            console.log(error.errno)
            if (error.errno === 1062) {
                return { code: 1062, message: "중복값 에러" }
            }
        })
}

exports.champCnt = async () => {
    return ChampInfo.createQueryBuilder("champ").getCount()
}

exports.getMatchDataCnt = async () => {
    return MatchData.createQueryBuilder().getCount()
}

exports.getMatchDataLimit = async () => {
    return MatchData.createQueryBuilder().select(["matchData"]).limit(5).execute()
}

exports.getChampList = async () => {
    return ChampInfo.createQueryBuilder("champ").getRawMany()
}

exports.targetChamp = async (champId) => {
    return ChampInfo.createQueryBuilder("champ")
        .where("champId = :champId", { champId })
        .select(["champ.win", "champ.lose", "champ.sampleNum", "champ.banCount"])
        .getOneOrFail()
}

exports.updateRate = async (champId, optionWinRate, matchId) => {
    await queryRunner.connect()
    await queryRunner.startTransaction()
    let dbupdate
    try {
        await queryRunner.manager
            .createQueryBuilder()
            .update(champinfo)
            .set(optionWinRate.set)
            .where("champId = :champId", { champId })
            .execute()
        await queryRunner.manager
            .createQueryBuilder()
            .update(matchdata)
            .set({ rateAnalyzed: true })
            .where("matchId = :matchId", { matchId })
            .execute()
            .then(() => {
                dbupdate = { message: `${matchId} 분석 성공` }
            })
        await queryRunner.commitTransaction()
    } catch (err) {
        console.log(err)
        dbupdate = { message: `${matchId} 분석 실패` }
        await queryRunner.rollbackTransaction()
    } finally {
        return dbupdate
    }
}

exports.addBanCnt = async (champId, matchId) => {
    await queryRunner.connect()
    await queryRunner.startTransaction()
    let dbupdate
    try {
        await queryRunner.manager
            .createQueryBuilder()
            .update(champinfo)
            .set({ banCount: () => "banCount+1" })
            .where("champId = :champId", { champId })
            .execute()
        await queryRunner.manager
            .createQueryBuilder()
            .update(matchdata)
            .set({ banAnalyzed: true })
            .where("matchId = :matchId", { matchId })
            .execute()
            .then(() => {
                dbupdate = { message: `${matchId} 분석 성공` }
            })
        await queryRunner.commitTransaction()
    } catch (err) {
        console.log(err)
        dbupdate = { message: `${matchId} 분석 실패` }
        await queryRunner.rollbackTransaction()
    } finally {
        return dbupdate
    }
}

exports.addPositionCnt = async (champId, optionPosition, matchId) => {
    await queryRunner.connect()
    await queryRunner.startTransaction()
    let dbupdate
    try {
        await queryRunner.manager
            .createQueryBuilder()
            .update(champinfo)
            .set(optionPosition.set)
            .where("champId = :champId", { champId })
            .execute()
        await queryRunner.manager
            .createQueryBuilder()
            .update(matchdata)
            .set({ positionAnalyzed: true })
            .where("matchId = :matchId", { matchId })
            .execute()
            .then(() => {
                dbupdate = { message: `${matchId} 분석 성공` }
            })
        await queryRunner.commitTransaction()
    } catch (err) {
        console.log(err)
        dbupdate = { message: `${matchId} 분석 실패` }
        await queryRunner.rollbackTransaction()
    } finally {
        return dbupdate
    }
}

exports.positionInfo = async (champId) => {
    return ChampInfo.createQueryBuilder()
        .where("champId = :champId", { champId })
        .select(["top", "jungle", "mid", "ad", "support"])
        .getRawMany()
}

exports.saveChampSpellInfo = async (champId, champName, spell1, spell2, matchId) => {
    await queryRunner.connect()
    await queryRunner.startTransaction()
    let dbupdate
    try {
        await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(champspell)
            .values({ champId, champName, spell1, spell2, sampleNum: 1 })
            .execute()
        await queryRunner.manager
            .createQueryBuilder()
            .update(matchdata)
            .set({ spellAnalyzed: true })
            .where("matchId = :matchId", { matchId })
            .execute()
            .then(() => {
                dbupdate = { message: `${matchId} 분석 성공` }
            })
        await queryRunner.commitTransaction()
    } catch (err) {
        console.log(err)
        dbupdate = { message: `${matchId} 분석 실패` }
        await queryRunner.rollbackTransaction()
    } finally {
        return dbupdate
    }
}

exports.updateChampSpellInfo = async (champId, spell1, spell2, matchId) => {
    await queryRunner.connect()
    await queryRunner.startTransaction()
    let dbupdate
    try {
        await queryRunner.manager
            .createQueryBuilder()
            .update(champspell)
            .set({ sampleNum: () => "sampleNum+1" })
            .where("champId = :champId", { champId })
            .andWhere("spell1 = :spell1", { spell1 })
            .andWhere("spell2 = :spell2", { spell2 })
            .execute()
        await queryRunner.manager
            .createQueryBuilder()
            .update(matchdata)
            .set({ spellAnalyzed: true })
            .where("matchId = :matchId", { matchId })
            .execute()
            .then(() => {
                dbupdate = { message: `${matchId} 분석 성공` }
            })
        await queryRunner.commitTransaction()
    } catch (err) {
        console.log(err)
        dbupdate = { message: `${matchId} 분석 실패` }
        await queryRunner.rollbackTransaction()
    } finally {
        return dbupdate
    }
}

exports.findSpellInfoData = async (champId, spell1, spell2) => {
    return await ChampSpell.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere("spell1 = :spell1", { spell1 })
        .andWhere("spell2 = :spell2", { spell2 })
        .getRawOne()
}

exports.ServiceSaveRate = async (
    champId,
    winRate,
    pickRate,
    banRate,
    topRate,
    jungleRate,
    midRate,
    adRate,
    supportRate
) => {
    return Champ.createQueryBuilder()
        .update(Champ)
        .set({
            win_rate: winRate,
            pick_rate: pickRate,
            ban_rate: banRate,
            top_rate: topRate,
            jungle_rate: jungleRate,
            mid_rate: midRate,
            ad_rate: adRate,
            support_rate: supportRate,
        })
        .where("champId = :champId", { champId })
        .execute()
}
