const { dataSource } = require("../../../orm")
const { Brackets } = require("typeorm")
const ChampSpell = dataSource.getRepository("champspell")

exports.findSpellInfoData = async (champId, spell1, spell2, version) => {
    return ChampSpell.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere("version = :version", { version })
        .andWhere(
            new Brackets((qb) => {
                qb.where("spell1 = :spell1", { spell1 })
                    .andWhere("spell2 = :spell2", { spell2 })
                    .orWhere(
                        new Brackets((qb2) => {
                            qb2.where("spell1 = :spell2", { spell2 }).andWhere("spell2 = :spell1", {
                                spell1,
                            })
                        })
                    )
            })
        )

        .getRawOne()
}

exports.saveChampSpellInfo = async (champId, spell1, spell2, version) => {
    return ChampSpell.createQueryBuilder()
        .insert()
        .values({ champId, spell1, spell2, sampleNum: 1, version })
        .execute()
}

exports.updateChampSpellInfo = async (champId, spell1, spell2, version) => {
    return ChampSpell.createQueryBuilder()
        .update(ChampSpell)
        .set({ sampleNum: () => "sampleNum+1" })
        .where("champId = :champId", { champId })
        .andWhere("version = :version", { version })
        .andWhere(
            new Brackets((qb) => {
                qb.where("spell1 = :spell1", { spell1 })
                    .andWhere("spell2 = :spell2", { spell2 })
                    .orWhere(
                        new Brackets((qb2) => {
                            qb2.where("spell1 = :spell2", { spell2 }).andWhere("spell2 = :spell1", {
                                spell1,
                            })
                        })
                    )
            })
        )
        .execute()
}
