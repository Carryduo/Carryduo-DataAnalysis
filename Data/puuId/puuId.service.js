const SummonerId = require("../../schemas/summonerId")
const PuuId = require("../../schemas/puuId")

exports.findSummonerId = async () => {
    return await SummonerId.find({}, { _id: false, summonerId: true })
}

exports.savePuuId = async (puuId) => {
    return await PuuId.create({ puuId })
}
