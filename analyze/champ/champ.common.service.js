const { dataSource } = require('../../orm')
const { Brackets } = require('typeorm')

const MatchId = dataSource.getRepository('matchid')

const logger = require('../../log')

exports.matchIdList = async () => {
    try {
        return await MatchId.createQueryBuilder()
            .select()
            .where(
                new Brackets((qb) => {
                    qb.where('rateAnalyzed = :result', { result: 0 })
                        .andWhere('spellAnalyzed = :result', { result: 0 })
                        .andWhere('banAnalyzed = :result', { result: 0 })
                        .andWhere('positionAnalyzed = :result', { result: 0 })
                })
            )
            .andWhere(
                new Brackets((qb) => {
                    qb.where('tier = :tier', { tier: 'DIAMOND' }).orWhere('tier = :tier2', {
                        tier2: 'PLATINUM',
                    })
                })
            )
            .orderBy('matchid.createdAt', 'DESC')
            .limit(500)
            .getRawMany()
    } catch (err) {
        logger.error(err, { message: ` - from matchIdList` })
    }
}

exports.successAnalyzed = async (matchId, option) => {
    try {
        return await MatchId.createQueryBuilder()
            .update()
            .set(option.set)
            .where('matchid.matchId = :matchId', { matchId })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from successAnalyzed` })
    }
}

exports.dropAnalyzed = async (matchId, option) => {
    try {
        return await MatchId.createQueryBuilder()
            .update()
            .set({ rateAnalyzed: 2, banAnalyzed: 2, positionAnalyzed: 2, spellAnalyzed: 2 })
            .where('matchid.matchId = :matchId', { matchId })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from dropAnalyzed` })
    }
}

exports.saveMatchIdVersion = async (matchId, version) => {
    try {
        return await MatchId.createQueryBuilder()
            .update()
            .set({ version })
            .where('matchid.matchId = :matchId', { matchId })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from saveMatchIdVersion` })
    }
}
