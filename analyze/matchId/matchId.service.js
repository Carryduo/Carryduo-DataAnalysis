const { dataSource } = require("../../orm")
const PuuId = dataSource.getRepository("puuid")
const MatchId = dataSource.getRepository("matchid")
const queryRunner = dataSource.createQueryRunner()
const matchid = require("../../entity/match.id")
const puuId = require("../../entity/puuid")
const MatchData = dataSource.getRepository("matchdata")
const { Brackets } = require("typeorm")

exports.findPuuId = async () => {
    return await PuuId.createQueryBuilder()
        .select(["puuid.tier", "puuid.summonerId", "puuid.division", "puuid.puuid"])
        .orderBy({
            "puuid.division": "ASC",
        })
        .where("puuid.analyzed = :analyzed", { analyzed: 0 })
        .limit(2000)
        .getMany()
}
exports.saveMatchId = async (matchId, tier, division, summonerId, puuid) => {
    await queryRunner.connect()
    await queryRunner.startTransaction()
    let data
    let dbupdate
    try {
        data = await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(matchid)
            .values({
                matchId,
                tier,
                division,
                summonerId,
                puuid,
            })
            .execute()
            .then(() => {
                return { code: 200, message: "정상" }
            })

        await queryRunner.manager
            .createQueryBuilder()
            .update(puuId)
            .set({ analyzed: 1 })
            .where("puuid.puuid = :puuid", { puuid })
            .execute()
            .then(() => {
                dbupdate = { message: `${puuid} 분석 성공` }
            })
        await queryRunner.commitTransaction()
    } catch (error) {
        if (error.errno === 1062) {
            data = { code: 1062, message: "중복값 에러" }
        }
        dbupdate = { message: `${puuid} 분석 실패` }
        await queryRunner.rollbackTransaction()
    } finally {
        return { data, dbupdate }
    }
}

exports.getMatchData = async () => {
    return await MatchData.createQueryBuilder()
        .select(["matchdata.matchData", "matchdata.id", "matchdata.matchId", 'matchdata.analyzed', 'matchdata.tier', 'matchdata.division'])
        .where(
            new Brackets((qb) => {
                qb.where("matchdata.tier = :tier", {
                    tier: "PLATINUM",
                }).orWhere("matchdata.tier = :tier2", {
                    tier2: "DIAMOND",
                })
            })
        )
        .getMany()
}

exports.transferAnlayzed = async (matchId, analyzed) => {
    return await MatchId.createQueryBuilder()
        .update()
        .set({
            analyzed
        })
        .where('matchid.matchId = :matchId', { matchId }).execute()
        .then(() => {
            return { success: true, message: 'matchId로 분석정보 이동 성공' }
        })
        .catch((error) => {
            console.log(error)
            return { success: false, message: 'matchId로 분석정보 이동 실패' }
        })
}
exports.disconnect = async () => {
    await queryRunner.release()
}
