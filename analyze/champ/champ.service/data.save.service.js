const { dataSource } = require("../../../orm")
const ChampInfo = dataSource.getRepository("champ_service")
const ChampSpell = dataSource.getRepository("champspell_service")

const { dataSource_service } = require("../../../service.orm")
const ChampService = dataSource_service.getRepository("CHAMP")
const ChampSpellService = dataSource_service.getRepository("CHAMPSPELL")
const ChampRateService = dataSource_service.getRepository("CHAMPRATE")

exports.allRateVersion = async () => {
    return ChampInfo.createQueryBuilder().select("distinct champ_service.version").getRawMany()
}

exports.rateInfo = async (version) => {
    return ChampInfo.createQueryBuilder().where("version = :version", { version }).getMany()
}

exports.saveRateDataToService = async (
    champId,
    win_rate,
    ban_rate,
    pick_rate,
    top_rate,
    jungle_rate,
    mid_rate,
    ad_rate,
    support_rate,
    version
) => {
    try {
        const check = await ChampRateService.createQueryBuilder()
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .getOne()
        if (!check) {
            await ChampRateService.createQueryBuilder()
                .insert()
                .values({
                    champId,
                    win_rate,
                    ban_rate,
                    pick_rate,
                    top_rate,
                    jungle_rate,
                    mid_rate,
                    ad_rate,
                    support_rate,
                    version,
                })
                .execute()
        } else if (check) {
            await ChampRateService.createQueryBuilder()
                .update(ChampRateService)
                .set({
                    win_rate,
                    ban_rate,
                    pick_rate,
                    top_rate,
                    jungle_rate,
                    mid_rate,
                    ad_rate,
                    support_rate,
                })
                .where("champId = :champId", { champId })
                .andWhere("version = :version", { version })
                .execute()
        }
    } catch (err) {}
}

exports.allSpellVersion = async () => {
    return ChampSpell.createQueryBuilder()
        .select("distinct champspell_service.version")
        .getRawMany()
}

exports.spellInfo = async (version) => {
    return ChampSpell.createQueryBuilder().where("version = :version", { version }).getMany()
}

exports.saveSpellDataToService = async (
    champId,
    spell1,
    spell2,
    pick_rate,
    sample_num,
    version
) => {
    const check = await ChampSpellService.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere("version = :version", { version })
        .getOne()
    if (!check) {
        await ChampSpellService.createQueryBuilder()
            .insert()
            .values({
                champId,
                spell1,
                spell2,
                pick_rate,
                sample_num,
                version,
            })
            .execute()
    } else if (check) {
        await ChampSpellService.createQueryBuilder()
            .update(ChampService)
            .set({
                pick_rate,
                sample_num,
            })
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .andWhere("spell1 = :spell1", { spell1 })
            .andWhere("spell2 = :spell2", { spell2 })
            .execute()
    }
}

exports.saveChampInfoService = async (
    champId,
    champ_name_en,
    champ_name_ko,
    champ_main_img,
    champ_img
) => {
    const check = await ChampService.createQueryBuilder()
        .where("champId = :champId", { champId })
        .getOne()

    if (!check) {
        await ChampService.createQueryBuilder()
            .insert()
            .values({
                champId,
                champ_name_en,
                champ_name_ko,
                champ_main_img,
                champ_img,
            })
            .execute()
    } else if (check) {
        return
    }
}
