const { dataSource } = require('../../orm')
const SummonerId = dataSource.getRepository('summonerid')


exports.saveSummonerId = (summonerId, tier, division) => {
    SummonerId.createQueryBuilder().insert().values({
        tier, summonerId, division
    }).execute()
    return

}