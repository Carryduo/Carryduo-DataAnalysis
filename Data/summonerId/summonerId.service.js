const SummonerId = require("../../schemas/summonerId")
const { dataSource } = require('../../orm')
const summonerId = dataSource.getRepository('summonerid')
exports.saveSummonerId = async (summonerId) => {
    return await SummonerId.create({ summonerId })
}

exports.test = async () => {
    const data = await summonerId.createQueryBuilder().select().getMany()
    console.log(data)
    return data
}