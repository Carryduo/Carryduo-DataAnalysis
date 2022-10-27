const { dataSource } = require("../../../orm")
const ChampBan = dataSource.getRepository("champban")

exports.createBanCnt = async (champId, banCount, version) => {
    return ChampBan.createQueryBuilder()
        .insert()
        .values({ champId, banCount, version, sampleNum: 1 })
        .execute()
}

exports.updateBanCnt = async (champId, option, version) => {
    return ChampBan.createQueryBuilder()
        .update(ChampBan)
        .set(option.set)
        .where("champId = :champId", { champId })
        .andWhere("version = :version", { version })
        .execute()
}

exports.deleteBanOldVersion = async () => {
    return ChampBan.createQueryBuilder()
        .delete()
        .where("version NOT IN (:...version)", { version: ["12.20", "12.19"] })
        .execute()
}

exports.getBanVersion = async (champId, version) => {
    return ChampBan.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere("version = :version", { version })
        .getOne()
}
