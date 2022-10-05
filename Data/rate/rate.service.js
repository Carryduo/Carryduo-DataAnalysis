const { dataSource } = require("../../orm")
const ChampInfo = dataSource.getRepository("champinfo")
const ChampSpell = dataSource.getRepository("champspell")
const MatchData = dataSource.getRepository("matchdata")

const { dataSource_service } = require("../../orm")
const { Brackets } = require("typeorm")
const ChampService = dataSource_service.getRepository("CHAMP")
const ChampSpellService = dataSource_service.getRepository("CHAMPSPELL")

exports.matchDataList = async () => {
    return await MatchData.createQueryBuilder()
        .select(["matchData", "id", "matchId"])
        .where(
            new Brackets((qb) => {
                qb.where("rateAnalyzed = :result", { result: 0 })
                    .andWhere("spellAnalyzed = :result", { result: 0 })
                    .andWhere("banAnalyzed = :result", { result: 0 })
                    .andWhere("positionAnalyzed = :result", { result: 0 })
            })
        )
        .andWhere(
            new Brackets((qb) => {
                qb.where("tier = :tier", { tier: "DIAMOND" }).orWhere("tier = :tier2", {
                    tier2: "PLATINUM",
                })
            })
        )
        .getRawMany()
}

exports.successAnalyzed = async (matchIds, option) => {
    return await MatchData.createQueryBuilder()
        .update()
        .set(option.set)
        .where("matchId IN (:...matchIds)", { matchIds })
        .execute()
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

exports.updateRate = async (champId, optionWinRate) => {
    return ChampInfo.createQueryBuilder()
        .update(ChampInfo)
        .set(optionWinRate.set)
        .where("champId = :champId", { champId })
        .execute()
}

exports.addBanCnt = async (champId) => {
    return ChampInfo.createQueryBuilder()
        .update(ChampInfo)
        .set({ banCount: () => "banCount+1" })
        .where("champId = :champId", { champId })
        .execute()
}

exports.addPositionCnt = async (champId, option) => {
    return ChampInfo.createQueryBuilder()
        .update(ChampInfo)
        .set(option.set)
        .where("champId = :champId", { champId })
        .execute()
}

exports.positionInfo = async (champId) => {
    return ChampInfo.createQueryBuilder()
        .where("champId = :champId", { champId })
        .select(["top", "jungle", "mid", "ad", "support"])
        .getRawMany()
}

exports.saveChampSpellInfo = async (champId, champName, spell1, spell2, matchId) => {
    return await ChampSpell.createQueryBuilder()
        .insert()
        .values({ champId, champName, spell1, spell2, sampleNum: 1 })
        .execute()
}

exports.updateChampSpellInfo = async (champId, spell1, spell2, matchId) => {
    return await ChampSpell.createQueryBuilder()
        .update(ChampSpell)
        .set({ sampleNum: () => "sampleNum+1" })
        .where("champId = :champId", { champId })
        .andWhere("spell1 = :spell1", { spell1 })
        .andWhere("spell2 = :spell2", { spell2 })
        .execute()
}

exports.findSpellInfoData = async (champId, spell1, spell2) => {
    return await ChampSpell.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere("spell1 = :spell1", { spell1 })
        .andWhere("spell2 = :spell2", { spell2 })
        .getRawOne()
}

exports.spellTotalCnt = async (champId) => {
    return await ChampSpell.createQueryBuilder()
        .where("champId = :champId", { champId })
        .select("SUM(sampleNum)", "total")
        .getRawOne()
}

// exports.spellTest = async (champId) => {
//     return ChampSpellServiceDev.createQueryBuilder()
//         .where("champId = :champId", { champId })
//         .orderBy("pickRate", "DESC")
//         .limit(2)
//         .execute()
// }

exports.ServiceSaveSpell = async (champId, spell1, spell2, pickRate, sampleNum) => {
    return await ChampSpellService.createQueryBuilder()
        .insert()
        .values({ champId, spell1, spell2, pick_rate: pickRate, sample_num: sampleNum })
        .execute()
}

exports.ServiceUpdateSpell = async (champId, spell1, spell2) => {
    return await ChampSpellService.createQueryBuilder()
        .update(ChampSpell)
        .set({ sampleNum: () => "sampleNum+1" })
        .where("champId = :champId", { champId })
        .andWhere("spell1 = :spell1", { spell1 })
        .andWhere("spell2 = :spell2", { spell2 })
        .execute()
}

exports.ServicefindSpellInfoData = async (champId, spell1, spell2) => {
    return await ChampSpellService.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere("spell1 = :spell1", { spell1 })
        .andWhere("spell2 = :spell2", { spell2 })
        .getRawOne()
}

exports.ServicePosition = async (champId, topRate, jungleRate, midRate, adRate, supportRate) => {
    return ChampService.createQueryBuilder()
        .update(ChampService)
        .set({
            top_rate: topRate,
            jungle_rate: jungleRate,
            mid_rate: midRate,
            ad_rate: adRate,
            support_rate: supportRate,
        })
        .where("champId = :champId", { champId })
        .execute()
}

exports.ServiceSaveRate = async (champId, winRate, pickRate, banRate) => {
    return ChampService.createQueryBuilder()
        .update(ChampService)
        .set({
            win_rate: winRate,
            pick_rate: pickRate,
            ban_rate: banRate,
        })
        .where("champId = :champId", { champId })
        .execute()
}
