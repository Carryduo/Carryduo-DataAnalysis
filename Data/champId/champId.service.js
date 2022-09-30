const { dataSource } = require("../../orm")
const ChampInfo = dataSource.getRepository("champinfo")

exports.saveChampId = async (champName, champId) => {
    return ChampInfo.createQueryBuilder()
        .insert()
        .values({
            champName,
            champId,
        })
        .execute()
        .then((value) => {
            return { code: 200, message: "정상" }
        })
        .catch((error) => {
            console.log(error.errno)
            if (error.errno === 1062) {
                return { code: 1062, message: "중복값 에러" }
            }
        })
}

exports.findChampId = async () => {
    return await ChampId.find({}, { _id: false, champId: true })
}
