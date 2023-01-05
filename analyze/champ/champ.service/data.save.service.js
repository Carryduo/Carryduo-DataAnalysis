const { dataSource } = require('../../../orm')
const ChampInfo = dataSource.getRepository('champ_service')
const ChampSpell = dataSource.getRepository('champspell_service')

const Position = dataSource.getRepository('champ_position')
const WinRate = dataSource.getRepository('champ_win_rate')
const Ban = dataSource.getRepository('champban')
const Spell = dataSource.getRepository('champspell')

const { dataSource_service } = require('../../../service.orm')
const ChampService = dataSource_service.getRepository('CHAMP')
const ChampSpellService = dataSource_service.getRepository('CHAMPSPELL')
const ChampRateService = dataSource_service.getRepository('CHAMPRATE')

const logger = require('../../../log')

exports.allRateVersion = async () => {
    try {
        return ChampInfo.createQueryBuilder().select('distinct champ_service.version').getRawMany()
    } catch (err) {
        logger.error(err, { message: ` - from allRateVersion` })
    }
}

exports.rateInfo = async (version) => {
    try {
        return ChampInfo.createQueryBuilder().where('version = :version', { version }).getMany()
    } catch (err) {
        logger.error(err, { message: ` - from rateInfo` })
    }
}

exports.rateDataCheck = async (champId, version) => {
    try {
        return ChampRateService.createQueryBuilder()
            .where('champId = :champId', { champId })
            .andWhere('version = :version', { version })
            .getOne()
    } catch (err) {
        logger.error(err, { message: ` - from rateDataCheck` })
    }
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
    } catch (err) {
        logger.error(err, { message: ` - from saveRateDataToService` })
    }
}
exports.updateRateDataToService = async (
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
            .where('champId = :champId', { champId })
            .andWhere('version = :version', { version })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from updateRateDataToService` })
    }
}

exports.allSpellVersion = async () => {
    try {
        return ChampSpell.createQueryBuilder()
            .select('distinct champspell_service.version')
            .getRawMany()
    } catch (err) {
        logger.error(err, { message: ` - from allSpellVersion` })
    }
}

exports.spellInfo = async (version) => {
    try {
        return ChampSpell.createQueryBuilder().where('version = :version', { version }).getMany()
    } catch (err) {
        logger.error(err, { message: ` - from spellInfo` })
    }
}

exports.saveSpellDataToService = async (
    champId,
    spell1,
    spell2,
    pick_rate,
    sample_num,
    version
) => {
    try {
        const check = await ChampSpellService.createQueryBuilder()
            .where('champId = :champId', { champId })
            .andWhere('version = :version', { version })
            .andWhere('spell1 = :spell1', { spell1 })
            .andWhere('spell2 = :spell2', { spell2 })
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
                .update(ChampSpellService)
                .set({
                    pick_rate,
                    sample_num,
                })
                .where('champId = :champId', { champId })
                .andWhere('version = :version', { version })
                .andWhere('spell1 = :spell1', { spell1 })
                .andWhere('spell2 = :spell2', { spell2 })
                .execute()
        }
    } catch (err) {
        logger.error(err, { message: ` - from saveSpellDataToService` })
    }
}

exports.checkChamp = async (champId) => {
    try {
        return await ChampService.createQueryBuilder()
            .where('champId = :champId', { champId })
            .select('champId')
            .getRawOne()
    } catch (err) {
        logger.error(err, { message: ` - from checkChamp` })
    }
}

exports.champIdList = async () => {
    try {
        const champIds = await ChampService.createQueryBuilder().select('champId').getRawMany()
        return champIds.map((v) => v[Object.keys(v)])
    } catch (err) {
        logger.error(err, { message: ` - from champIdList` })
    }
}

exports.findNewChampId = async (champIds) => {
    try {
        const positionNewChamp = await Position.createQueryBuilder()
            .select('DISTINCT champId')
            .where('champId NOT IN (:champIds)', {
                champIds,
            })
            .getRawMany()
        const winRateNewChamp = await WinRate.createQueryBuilder()
            .select('DISTINCT champId')
            .where('champId NOT IN (:champIds)', {
                champIds,
            })
            .getRawMany()
        const banNewChamp = await Ban.createQueryBuilder()
            .select('DISTINCT champId')
            .where('champId NOT IN (:champIds)', {
                champIds,
            })
            .getRawMany()
        const spellNewChamp = await Spell.createQueryBuilder()
            .select('DISTINCT champId')
            .where('champId NOT IN (:champIds)', {
                champIds,
            })
            .getRawMany()
        return { positionNewChamp, winRateNewChamp, banNewChamp, spellNewChamp }
    } catch (err) {
        logger.error(err, { message: ` - from findNewChampId` })
    }
}

exports.createNewChamp = async (newChampId, champ_main_img, champ_img) => {
    try {
        for (let n of newChampId) {
            ChampService.createQueryBuilder()
                .insert()
                .values({
                    champId: n,
                    champ_name_en: 'Updating',
                    champ_name_ko: '업데이트 중',
                    champ_main_img,
                    champ_img,
                })
                .execute()
        }
    } catch (err) {
        logger.error(err, { message: ` - from createNewChamp` })
    }
}

exports.saveChampInfoService = async (
    champId,
    champ_name_en,
    champ_name_ko,
    champ_main_img,
    champ_img
) => {
    try {
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
    } catch (err) {
        logger.error(err, { message: ` - from saveChampInfoService` })
    }
}
exports.updateChampInfoService = async (champId, champ_img) => {
    try {
        await ChampService.createQueryBuilder()
            .update(ChampService)
            .set({
                champ_img,
            })
            .where('champId = :champId', { champId })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from updateChampInfoService` })
    }
}
