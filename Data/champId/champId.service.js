const ChampId = require("../../schemas/champId")
exports.saveChampId = async (champId) => {
    return await ChampId.create({ champId })
}

exports.findChampId = async () => {
    return await ChampId.find({}, { _id: false, champId: true })
}
