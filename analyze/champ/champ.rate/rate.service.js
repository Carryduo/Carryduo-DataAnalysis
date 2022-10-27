const { dataSource } = require("../../../orm")
const ChampInfo = dataSource.getRepository("champinfo")

exports.getRateVersion = async (champId, version) => {
    return await ChampInfo.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere("version = :version", { version })
        .getOne()
}

exports.createRate = async (champId, version, win) => {
    if (win) {
        return ChampInfo.createQueryBuilder()
            .insert()
            .values({ champId, version, win: 1, sampleNum: 1 })
            .execute()
    } else if (!win) {
        return ChampInfo.createQueryBuilder()
            .insert()
            .values({ champId, version, lose: 1, sampleNum: 1 })
            .execute()
    }
}

exports.updateRate = async (champId, version, updateOptionWinRate) => {
    return ChampInfo.createQueryBuilder()
        .update(ChampInfo)
        .set(updateOptionWinRate.set)
        .where("champId = :champId", { champId })
        .andWhere("version = :version", { version })
        .execute()
}

exports.deleteRateOldVersion = async () => {
    return ChampInfo.createQueryBuilder()
        .delete()
        .where("version NOT IN (:...version)", { version: ["12.20", "12.19"] })
        .execute()
}
