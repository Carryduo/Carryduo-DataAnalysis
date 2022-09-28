const { dataSource } = require('../../orm')
const PuuId = dataSource.getRepository('puuid')
const MatchId = dataSource.getRepository('matchid')

exports.findPuuId = async () => {
    return await PuuId.createQueryBuilder().select(['puuid.tier', 'puuid.summonerId', 'puuid.division', 'puuid.puuid']).orderBy({
        'puuid.division': 'ASC'
    }).getMany()
}
exports.saveMatchId = (matchId, tier, division, summonerId, puuid) => {
    const data = MatchId.createQueryBuilder().insert().values({
        matchId, tier, division, summonerId, puuid
    }).execute()
        .then((value) => { return { code: 200, message: '정상' } })
        .catch((error) => {
            console.log(error.errno)
            if (error.errno === 1062) {
                return { code: 1062, message: '중복값 에러' }
            }
        })
    return data
}
