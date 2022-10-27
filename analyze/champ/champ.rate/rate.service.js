const { dataSource } = require("../../../orm")
const ChampWinRate = dataSource.getRepository("champ_win_rate")
const ChampService = dataSource.getRepository("champ_service")

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
    return ChampWinRate.createQueryBuilder("winRate").select("winRate.version").getMany()
}

exports.rateInfo = async (version) => {
    return ChampWinRate.createQueryBuilder().where("version = :version", { version }).getMany()
}

exports.saveWinRate = async (champId, winRate, version) => {
    const check = await ChampService.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere("version = :version", { version })
        .getOne()
    if (!check) {
        await ChampService.createQueryBuilder()
            .insert()
            .values({ champId, win_rate: winRate, version })
            .execute()
    } else if (check) {
        await ChampService.createQueryBuilder()
            .update(ChampService)
            .set({ win_rate: winRate })
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .execute()
    }
}
