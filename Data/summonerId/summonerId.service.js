const { dataSource } = require('../../orm')
const SummonerId = dataSource.getRepository('summonerid')
const test = dataSource.getRepository('test')

exports.saveSummonerId = (summonerId, tier, division) => {
    SummonerId.createQueryBuilder().insert().values({
        tier, summonerId, division
    }).execute()
    return

}