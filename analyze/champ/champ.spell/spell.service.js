const { dataSource } = require("../../../orm")
const { Brackets } = require("typeorm")
const ChampSpell = dataSource.getRepository("champspell")
const ChampSpellService = dataSource.getRepository("champspell_service")

const logger = require("../../../log")

exports.findSpellInfo = async (champId, spell1, spell2, version) => {
    try {
        return ChampSpell.createQueryBuilder()
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .andWhere(
                new Brackets((qb) => {
                    qb.where("spell1 = :spell1", { spell1 })
                        .andWhere("spell2 = :spell2", { spell2 })
                        .orWhere(
                            new Brackets((qb2) => {
                                qb2.where("spell1 = :spell2", { spell2 }).andWhere(
                                    "spell2 = :spell1",
                                    {
                                        spell1,
                                    }
                                )
                            })
                        )
                })
            )

            .getRawOne()
    } catch (err) {
        logger.error(err, { message: ` - from findSpellInfo` })
    }
}

exports.saveChampSpellInfo = async (champId, spell1, spell2, version) => {
    try {
        return ChampSpell.createQueryBuilder()
            .insert()
            .values({ champId, spell1, spell2, sampleNum: 1, version })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from saveChampSpellInfo` })
    }
}

exports.updateChampSpellInfo = async (champId, spell1, spell2, version) => {
    try {
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
                                qb2.where("spell1 = :spell2", { spell2 }).andWhere(
                                    "spell2 = :spell1",
                                    {
                                        spell1,
                                    }
                                )
                            })
                        )
                })
            )
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from updateChampSpellInfo` })
    }
}

exports.allSpellVersion = async () => {
    try {
        return ChampSpell.createQueryBuilder().select("distinct champspell.version").getRawMany()
    } catch (err) {
        logger.error(err, { message: ` - from allSpellVersion` })
    }
}

exports.findSpellData = async (version) => {
    try {
        return await ChampSpell.createQueryBuilder()
            .where("version = :version", { version })
            .getMany()
    } catch (err) {
        logger.error(err, { message: ` - from findSpellData` })
    }
}

//챔피언 게임 수 합산해서 가져오기
exports.spellTotalCnt = async (champId, version) => {
    try {
        return await ChampSpell.createQueryBuilder()
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .select("SUM(sampleNum)", "total")
            .getRawOne()
    } catch (err) {
        logger.error(err, { message: ` - from spellTotalCnt` })
    }
}

exports.findSpellInfoData = async (champId, spell1, spell2, version) => {
    try {
        return ChampSpellService.createQueryBuilder()
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .andWhere(
                new Brackets((qb) => {
                    qb.where("spell1 = :spell1", { spell1 })
                        .andWhere("spell2 = :spell2", { spell2 })
                        .orWhere(
                            new Brackets((qb2) => {
                                qb2.where("spell1 = :spell2", { spell2 }).andWhere(
                                    "spell2 = :spell1",
                                    {
                                        spell1,
                                    }
                                )
                            })
                        )
                })
            )
            .getOne()
    } catch (err) {
        logger.error(err, { message: ` - from findSpellInfoData` })
    }
}

exports.saveSpellData = async (champId, spell1, spell2, pickRate, sampleNum, version) => {
    try {
        return ChampSpellService.createQueryBuilder()
            .insert()
            .values({
                champId,
                spell1,
                spell2,
                pick_rate: pickRate,
                sample_num: sampleNum,
                version,
            })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from saveSpellData` })
    }
}

exports.updateChampSpellData = async (champId, spell1, spell2, pickRate, sampleNum, version) => {
    try {
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
                                qb2.where("spell1 = :spell2", { spell2 }).andWhere(
                                    "spell2 = :spell1",
                                    {
                                        spell1,
                                    }
                                )
                            })
                        )
                })
            )
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from updateChampSpellData` })
    }
}
