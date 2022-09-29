const { dataSource } = require('../../orm')
const PuuId = dataSource.getRepository('puuid')
const SummonerId = dataSource.getRepository('summonerid')
const puuId = require('../../entity/puuid')
const summonerid = require('../../entity/summoner.id')
const queryRunner = dataSource.createQueryRunner()
const { Brackets } = require('typeorm')

exports.findSummonerId = async () => {
    return await SummonerId.createQueryBuilder().select(['summonerid.tier', 'summonerid.summonerId', 'summonerid.division', 'summonerid.analyzed']).orderBy({
        'summonerid.tier': 'ASC',
        'summonerid.division': 'ASC'
    })
        .where(
            new Brackets((qb) => {
                qb.where('summonerid.tier = :tier', {
                    tier: 'PLATINUM',
                })
                    .orWhere('summonerid.tier = :tier2', {
                        tier2: 'DIAMOND'
                    });


            })
        ).andWhere('summonerid.analyzed = :analyzed', {
            analyzed: true,
        })
        .getMany()
}

exports.savePuuId = async (puuid, tier, division, summonerId) => {
    await queryRunner.connect()
    await queryRunner.startTransaction()
    let data
    let dbupdate
    try {
        data = await queryRunner.manager.createQueryBuilder().insert().into(puuId)
            .values({ puuid, tier, division, summonerId })
            .execute()
            .then((value) => { return { code: 200, message: '정상' } })
        await queryRunner.manager.createQueryBuilder()
            .update(summonerid)
            .set({ analyzed: true })
            .where('summonerid.summonerId = :summonerId', { summonerId })
            .execute()
            .then(() => {
                dbupdate = { message: `${summonerId}  분석 성공` }
                return
            })
        await queryRunner.commitTransaction()
    } catch (error) {
        if (error.errno === 1062) {
            data = { code: 1062, message: '중복값 에러' }
        }
        dbupdate = { message: `${summonerId}  분석 실패` }
        await queryRunner.rollbackTransaction()
    } finally {
        // await queryRunner.release()
        return { data, dbupdate }
    }
}

exports.disconnect = async () => {
    await queryRunner.release()
}
