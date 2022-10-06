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
                    .orWhere("spellAnalyzed = :result", { result: 0 })
                    .orWhere("banAnalyzed = :result", { result: 0 })
                    .orWhere("positionAnalyzed = :result", { result: 0 })
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

//챔피언 ID 저장
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

//챔피언 개수
exports.champCnt = async () => {
    return ChampInfo.createQueryBuilder("champ").getCount()
}

//매치데이터 개수
exports.getMatchDataCnt = async () => {
    return MatchData.createQueryBuilder().getCount()
}

//챔피언 데이터 리스트
exports.getChampList = async () => {
    return ChampInfo.createQueryBuilder("champ").getRawMany()
}

// 챔피언 승, 패, 게임수, 밴 수 가져오기
exports.targetChamp = async (champId) => {
    return ChampInfo.createQueryBuilder("champ")
        .where("champId = :champId", { champId })
        .select(["champ.win", "champ.lose", "champ.sampleNum", "champ.banCount"])
        .getOneOrFail()
}

// 챔피언 승/패 카운팅
exports.updateRate = async (champId, optionWinRate) => {
    return ChampInfo.createQueryBuilder()
        .update(ChampInfo)
        .set(optionWinRate.set)
        .where("champId = :champId", { champId })
        .execute()
}

// 챔피언 밴 카운팅
exports.addBanCnt = async (champId) => {
    return ChampInfo.createQueryBuilder()
        .update(ChampInfo)
        .set({ banCount: () => "banCount+1" })
        .where("champId = :champId", { champId })
        .execute()
}

//챔피언 포지션 카운팅
exports.addPositionCnt = async (champId, option) => {
    return ChampInfo.createQueryBuilder()
        .update(ChampInfo)
        .set(option.set)
        .where("champId = :champId", { champId })
        .execute()
}

//챔피언 포지션 데이터 가져오기
exports.positionInfo = async (champId) => {
    return ChampInfo.createQueryBuilder()
        .where("champId = :champId", { champId })
        .select(["top", "jungle", "mid", "ad", "support"])
        .getRawMany()
}

exports.findSpellData = async (champId) => {
    return await ChampSpell.createQueryBuilder().getRawMany()
}

//챔피언 스펠정보 저장
exports.saveChampSpellInfo = async (champId, champName, spell1, spell2, matchId) => {
    return ChampSpell.createQueryBuilder()
        .insert()
        .values({ champId, champName, spell1, spell2, sampleNum: 1 })
        .execute()
}

//챔피언 스펠정보 업데이트
exports.updateChampSpellInfo = async (champId, spell1, spell2, matchId) => {
    return ChampSpell.createQueryBuilder()
        .update(ChampSpell)
        .set({ sampleNum: () => "sampleNum+1" })
        .where("champId = :champId", { champId })
        .andWhere(
            new Brackets((qb) => {
                qb.where("spell1 = :spell1", { spell1 })
                    .andWhere("spell2 = :spell2", { spell2 })
                    .orWhere(
                        new Brackets((qb2) => {
                            qb2.where("spell1 = :spell2", { spell2 }).andWhere("spell2 = :spell1", {
                                spell1,
                            })
                        })
                    )
            })
        )
        .execute()
}

//쳄피언 스펠정보 가져오기
exports.findSpellInfoData = async (champId, spell1, spell2) => {
    return ChampSpell.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere(
            new Brackets((qb) => {
                qb.where("spell1 = :spell1", { spell1 })
                    .andWhere("spell2 = :spell2", { spell2 })
                    .orWhere(
                        new Brackets((qb2) => {
                            qb2.where("spell1 = :spell2", { spell2 }).andWhere("spell2 = :spell1", {
                                spell1,
                            })
                        })
                    )
            })
        )

        .getRawOne()
}

//챔피언 게임 수 합산해서 가져오기
exports.spellTotalCnt = async (champId) => {
    return await ChampSpell.createQueryBuilder()
        .where("champId = :champId", { champId })
        .select("SUM(sampleNum)", "total")
        .getRawOne()
}

// ==========================================================================================//
//서비스 DB 저장 관련 쿼리
exports.ServiceSaveSpell = async (champId, spell1, spell2, pickRate, sampleNum) => {
    return ChampSpellService.createQueryBuilder()
        .insert()
        .values({ champId, spell1, spell2, pick_rate: pickRate, sample_num: sampleNum })
        .execute()
}

exports.ServicefindSpellInfoData = async (champId, spell1, spell2) => {
    return ChampSpellService.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere(
            new Brackets((qb) => {
                qb.where("spell1 = :spell1", { spell1 })
                    .andWhere("spell2 = :spell2", { spell2 })
                    .orWhere(
                        new Brackets((qb2) => {
                            qb2.where("spell1 = :spell2", { spell2 }).andWhere("spell2 = :spell1", {
                                spell1,
                            })
                        })
                    )
            })
        )
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
