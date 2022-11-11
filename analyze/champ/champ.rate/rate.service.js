const { dataSource } = require("../../../orm")
const ChampWinRate = dataSource.getRepository("champ_win_rate")
const ChampBan = dataSource.getRepository("champban")
const ChampService = dataSource.getRepository("champ_service")

const logger = require("../../../log")

//rate
exports.getRateVersion = async (champId, version) => {
    try {
        return await ChampWinRate.createQueryBuilder()
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .getOne()
    } catch (err) {
        logger.error(err, { message: ` - from getRateVersion` })
    }
}

exports.createRate = async (champId, version, win) => {
    try {
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
    } catch (err) {
        logger.error(err, { message: ` - from createRate` })
    }
}

exports.updateRate = async (champId, version, updateOptionWinRate) => {
    try {
        return ChampWinRate.createQueryBuilder()
            .update(ChampWinRate)
            .set(updateOptionWinRate.set)
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from updateRate` })
    }
}

exports.allWinRateVersion = async () => {
    try {
        return ChampWinRate.createQueryBuilder()
            .select("distinct champ_win_rate.version")
            .getRawMany()
    } catch (err) {
        logger.error(err, { message: ` - from allWinRateVersion` })
    }
}

exports.WinrateInfo = async (version) => {
    try {
        return ChampWinRate.createQueryBuilder().where("version = :version", { version }).getMany()
    } catch (err) {
        logger.error(err, { message: ` - from WinrateInfo` })
    }
}

exports.matchTotalCnt = async (version) => {
    try {
        return ChampWinRate.createQueryBuilder()
            .where("version = :version", { version })
            .select("SUM(sampleNum)", "total")
            .getRawOne()
    } catch (err) {
        logger.error(err, { message: ` - from matchTotalCnt` })
    }
}

exports.saveWinPickRate = async (champId, winRate, pickRate, version) => {
    try {
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
    } catch (err) {
        logger.error(err, { message: ` - from saveWinPickRate` })
    }
}

//ban
exports.createBanCnt = async (champId, banCount, version) => {
    try {
        return ChampBan.createQueryBuilder()
            .insert()
            .values({ champId, banCount, version, sampleNum: 1 })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from createBanCnt` })
    }
}

exports.updateBanCnt = async (champId, option, version) => {
    try {
        return ChampBan.createQueryBuilder()
            .update(ChampBan)
            .set(option.set)
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from updateBanCnt` })
    }
}

exports.getBanVersion = async (champId, version) => {
    try {
        return ChampBan.createQueryBuilder()
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .getOne()
    } catch (err) {
        logger.error(err, { message: ` - from getBanVersion` })
    }
}

exports.allBanVersion = async () => {
    try {
        return ChampBan.createQueryBuilder().select("distinct champban.version").getRawMany()
    } catch (err) {
        logger.error(err, { message: ` - from allBanVersion` })
    }
}

exports.banInfo = async (version) => {
    try {
        return ChampBan.createQueryBuilder().where("version = :version", { version }).getMany()
    } catch (err) {
        logger.error(err, { message: ` - from banInfo` })
    }
}

exports.saveBanRate = async (champId, banRate, version) => {
    try {
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
    } catch (err) {
        logger.error(err, { message: ` - from saveBanRate` })
    }
}
