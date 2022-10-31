const { dataSource } = require("../../orm")
const { Brackets } = require("typeorm")

const MatchId = dataSource.getRepository("matchid")

exports.matchIdList = async () => {
    return await MatchId.createQueryBuilder()
        .select()
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
        .limit(500)
        .getRawMany()
}

exports.successAnalyzed = async (matchId, option) => {
    return await MatchId.createQueryBuilder()
        .update()
        .set(option.set)
        .where("matchid.matchId = :matchId", { matchId })
        .execute()
}

exports.dropAnalyzed = async (matchId, option) => {
    return await MatchId.createQueryBuilder()
        .update()
        .set({ rateAnalyzed: 2, banAnalyzed: 2, positionAnalyzed: 2, spellAnalyzed: 2 })
        .where("matchid.matchId = :matchId", { matchId })
        .execute()
}
