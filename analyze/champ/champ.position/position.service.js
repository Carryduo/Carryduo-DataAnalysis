const { dataSource } = require("../../../orm")
const Position = dataSource.getRepository("champ_position")
const ChampService = dataSource.getRepository("champ_service")

exports.createPosition = async (option) => {
    return Position.createQueryBuilder().insert().values(option.set).execute()
}

exports.updatePosition = async (champId, option, version) => {
    return Position.createQueryBuilder()
        .update(Position)
        .set(option.set)
        .where("champId = :champId", { champId })
        .andWhere("version = :version", { version })
        .execute()
}

exports.getPostionVersion = async (champId, version) => {
    return Position.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere("version = :version", { version })
        .getOne()
}

exports.allPositionVersion = async () => {
    return Position.createQueryBuilder().select("distinct champ_position.version").getRawMany()
}

exports.getPositionTargetVersion = async (version) => {
    return Position.createQueryBuilder().where("version = :version", { version }).getMany()
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
}
