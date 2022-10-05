const { dataSource, dataSource_service } = require('../../orm')
const SummonerId = dataSource.getRepository('summonerid')

exports.saveSummonerId = (summonerId, tier, division) => {
    const data = SummonerId.createQueryBuilder().insert().values({
        tier, summonerId, division
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