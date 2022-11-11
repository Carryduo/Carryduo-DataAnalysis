const { dataSource } = require("../../../orm")
const Position = dataSource.getRepository("champ_position")
const ChampService = dataSource.getRepository("champ_service")

const logger = require("../../../log")

exports.createPosition = async (option) => {
    try {
        return Position.createQueryBuilder().insert().values(option.set).execute()
    } catch (err) {
        logger.error(err, { message: ` - from createPosition` })
    }
}

exports.updatePosition = async (champId, option, version) => {
    try {
        return Position.createQueryBuilder()
            .update(Position)
            .set(option.set)
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from updatePosition` })
    }
}

exports.getPostionVersion = async (champId, version) => {
    try {
        return Position.createQueryBuilder()
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .getOne()
    } catch (err) {
        logger.error(err, { message: ` - from getPostionVersion` })
    }
}

exports.allPositionVersion = async () => {
    try {
        return Position.createQueryBuilder().select("distinct champ_position.version").getRawMany()
    } catch (err) {
        logger.error(err, { message: ` - from allPositionVersion` })
    }
}

exports.getPositionTargetVersion = async (version) => {
    try {
        return Position.createQueryBuilder().where("version = :version", { version }).getMany()
    } catch (err) {
        logger.error(err, { message: ` - from getPositionTargetVersion` })
    }
}

exports.savePositionRate = async (
    champId,
    topRate,
    jungleRate,
    midRate,
    adRate,
    supportRate,
    version
) => {
    try {
        const check = await ChampService.createQueryBuilder()
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .getOne()
        if (!check) {
            await ChampService.createQueryBuilder()
                .insert()
                .values({
                    champId,
                    top_rate: topRate,
                    jungle_rate: jungleRate,
                    mid_rate: midRate,
                    ad_rate: adRate,
                    support_rate: supportRate,
                    version,
                })
                .execute()
        } else if (check) {
            await ChampService.createQueryBuilder()
                .update(ChampService)
                .set({
                    top_rate: topRate,
                    jungle_rate: jungleRate,
                    mid_rate: midRate,
                    ad_rate: adRate,
                    support_rate: supportRate,
                })
                .where("champId = :champId", { champId })
                .andWhere("version = :version", { version })
                .execute()
        }
    } catch (err) {
        logger.error(err, { message: ` - from savePositionRate` })
    }
}
