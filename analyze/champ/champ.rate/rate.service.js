const { dataSource } = require("../../../orm")
const ChampWinRate = dataSource.getRepository("champ_win_rate")
const ChampBan = dataSource.getRepository("champban")
const ChampService = dataSource.getRepository("champ_service")

//rate
exports.getRateVersion = async (champId, version) => {
    return await ChampWinRate.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere("version = :version", { version })
        .getOne()
}

exports.createRate = async (champId, version, win) => {
    if (win) {
        return ChampWinRate.createQueryBuilder()
            .insert()
            .values({ champId, version, win: 1, sampleNum: 1 })
            .execute()
    } else if (!win) {
        return ChampWinRate.createQueryBuilder()
            .insert()
            .values({ champId, version, lose: 1, sampleNum: 1 })
            .execute()
    }
}

exports.updateRate = async (champId, version, updateOptionWinRate) => {
    return ChampWinRate.createQueryBuilder()
        .update(ChampInfo)
        .set(updateOptionWinRate.set)
        .where("champId = :champId", { champId })
        .andWhere("version = :version", { version })
        .execute()
}

exports.allWinRateVersion = async () => {
    return ChampWinRate.createQueryBuilder().select("distinct champ_win_rate.version").getRawMany()
}

exports.WinrateInfo = async (version) => {
    return ChampWinRate.createQueryBuilder().where("version = :version", { version }).getMany()
}

exports.matchTotalCnt = async (version) => {
    return ChampWinRate.createQueryBuilder()
        .where("version = :version", { version })
        .select("SUM(sampleNum)", "total")
        .getRawOne()
}

exports.saveWinPickRate = async (champId, winRate, pickRate, version) => {
    const check = await ChampService.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere("version = :version", { version })
        .getOne()
    if (!check) {
        await ChampService.createQueryBuilder()
            .insert()
            .values({ champId, win_rate: winRate, pick_rate: pickRate, version })
            .execute()
    } else if (check) {
        await ChampService.createQueryBuilder()
            .update(ChampService)
            .set({ win_rate: winRate, pick_rate: pickRate })
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .execute()
    }
}

//ban
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

exports.getBanVersion = async (champId, version) => {
    return ChampBan.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere("version = :version", { version })
        .getOne()
}

exports.allBanVersion = async () => {
    return ChampBan.createQueryBuilder().select("distinct champban.version").getRawMany()
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
