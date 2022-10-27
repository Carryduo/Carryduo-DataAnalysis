const { dataSource } = require("../../../orm")
const Position = dataSource.getRepository("champ-position")

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
