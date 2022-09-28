const { dataSource } = require('../../orm')
const PuuId = dataSource.getRepository('puuid')
const SummonerId = dataSource.getRepository('summonerid')

exports.findSummonerId = async () => {
    return await SummonerId.createQueryBuilder().select(['summonerid.tier', 'summonerid.summonerId', 'summonerid.division']).orderBy({
        'summonerid.division': 'ASC'
    }).getMany()
}

exports.savePuuId = (puuid, tier, division, summonerId) => {
    PuuId.createQueryBuilder().insert().values({
        puuid, tier, division, summonerId
    }).execute()
    return
}
