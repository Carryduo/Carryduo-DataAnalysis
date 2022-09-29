const { dataSource } = require('../../orm')
const PuuId = dataSource.getRepository('puuid')
const MatchId = dataSource.getRepository('matchid')
const queryRunner = dataSource.createQueryRunner()
const matchid = require('../../entity/match.id')
const puuId = require('../../entity/puuid')

exports.findPuuId = async () => {
    return await PuuId.createQueryBuilder().select(['puuid.tier', 'puuid.summonerId', 'puuid.division', 'puuid.puuid']).orderBy({
        'puuid.division': 'ASC'
    }).where('puuid.analyzed = :analyzed', { analyzed: false }).getMany()
}
exports.saveMatchId = async (matchId, tier, division, summonerId, puuid) => {
    await queryRunner.connect()
    await queryRunner.startTransaction()
    let data
    let dbupdate
    try {
        data = await queryRunner.manager.createQueryBuilder().insert().into(matchid).values({
            matchId, tier, division, summonerId, puuid
        }).execute()
            .then(() => { return { code: 200, message: '정상' } })

        await queryRunner.manager.createQueryBuilder().update(puuId)
            .set({ analyzed: true })
            .where('puuid.puuid = :puuid', { puuid }).execute()
            .then(() => {
                dbupdate = { message: `${puuid} 분석 성공` }
            })
        await queryRunner.commitTransaction()
    } catch (error) {
        if (error.errno === 1062) {
            data = { code: 1062, message: '중복값 에러' }
        }
        dbupdate = { message: `${puuid} 분석 실패` }
        await queryRunner.rollbackTransaction()
    } finally {
        return { data, dbupdate }
    }
}

exports.disconnect = async () => {
    await queryRunner.release()
}
