const ChampId = require("../../schemas/champId")
exports.saveChampId = async (champId) => {
    return await ChampId.create({ champId })
}
