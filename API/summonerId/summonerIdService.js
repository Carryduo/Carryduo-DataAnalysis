const SummonerId = require("../../schemas/summonerId")

exports.saveSummonerId = async (summonerId) => {
    return await SummonerId.create({ summonerId })
}
