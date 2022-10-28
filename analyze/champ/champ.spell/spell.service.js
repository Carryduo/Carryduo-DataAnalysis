const { dataSource } = require("../../../orm")
const { Brackets } = require("typeorm")
const ChampSpell = dataSource.getRepository("champspell")
const ChampSpellService = dataSource.getRepository("champspell_service")

exports.findSpellInfo = async (champId, spell1, spell2, version) => {
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

exports.allSpellVersion = async () => {
    return ChampSpell.createQueryBuilder().select("distinct champspell.version").getRawMany()
}

exports.findSpellData = async (version) => {
    return await ChampSpell.createQueryBuilder().where("version = :version", { version }).getMany()
}

//챔피언 게임 수 합산해서 가져오기
exports.spellTotalCnt = async (champId, version) => {
    return await ChampSpell.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere("version = :version", { version })
        .select("SUM(sampleNum)", "total")
        .getRawOne()
}

exports.findSpellInfoData = async (champId, spell1, spell2, version) => {
    return ChampSpellService.createQueryBuilder()
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
        .getOne()
}

exports.saveSpellData = async (champId, spell1, spell2, pickRate, sampleNum, version) => {
    return ChampSpellService.createQueryBuilder()
        .insert()
        .values({ champId, spell1, spell2, pick_rate: pickRate, sample_num: sampleNum, version })
        .execute()
}

exports.updateChampSpellData = async (champId, spell1, spell2, pickRate, sampleNum, version) => {
    return ChampSpellService.createQueryBuilder()
        .update(ChampSpellService)
        .set({ pick_rate: pickRate, sample_num: sampleNum })
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
