const { dataSource } = require("../../../orm")
const ChampBan = dataSource.getRepository("champban")
const ChampService = dataSource.getRepository("champ_service")

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

exports.allBanVersion = async () => {
    return ChampBan.createQueryBuilder("ban").select("ban.version").getMany()
}

exports.banInfo = async (version) => {
    return ChampBan.createQueryBuilder().where("version = :version", { version }).getMany()
}

exports.saveBanRate = async (champId, banRate, version) => {
    const check = await ChampService.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere("version = :version", { version })
        .getOne()
    if (!check) {
        await ChampService.createQueryBuilder()
            .insert()
            .values({ champId, ban_rate: banRate, version })
            .execute()
    } else if (check) {
        await ChampService.createQueryBuilder()
            .update(ChampService)
            .set({ ban_rate: banRate })
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .execute()
    }
}
