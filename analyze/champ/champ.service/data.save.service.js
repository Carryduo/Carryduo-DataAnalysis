const { dataSource } = require("../../../orm")
const Position = dataSource.getRepository("champ_position")
const WinRate = dataSource.getRepository("champ_win_rate")
const Ban = dataSource.getRepository("champban")
const Spell = dataSource.getRepository("champspell")

const { dataSource_service } = require("../../../service.orm")
const ChampService = dataSource_service.getRepository("CHAMP")

const logger = require("../../../log")

exports.checkChamp = async (champId) => {
    try {
        return await ChampService.createQueryBuilder()
            .where("champId = :champId", { champId })
            .select("champId")
            .getRawOne()
    } catch (err) {
        logger.error(err, { message: ` - from checkChamp` })
    }
}

exports.champIdList = async () => {
    try {
        const champIds = await ChampService.createQueryBuilder().select("champId").getRawMany()
        return champIds.map((v) => v[Object.keys(v)])
    } catch (err) {
        logger.error(err, { message: ` - from champIdList` })
    }
}

exports.findNewChampId = async (champIds) => {
    try {
        const positionNewChamp = await Position.createQueryBuilder()
            .select("DISTINCT champId")
            .where("champId NOT IN (:champIds)", {
                champIds,
            })
            .getRawMany()
        const winRateNewChamp = await WinRate.createQueryBuilder()
            .select("DISTINCT champId")
            .where("champId NOT IN (:champIds)", {
                champIds,
            })
            .getRawMany()
        const banNewChamp = await Ban.createQueryBuilder()
            .select("DISTINCT champId")
            .where("champId NOT IN (:champIds)", {
                champIds,
            })
            .getRawMany()
        const spellNewChamp = await Spell.createQueryBuilder()
            .select("DISTINCT champId")
            .where("champId NOT IN (:champIds)", {
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
                    champ_name_en: "Updating",
                    champ_name_ko: "업데이트 중",
                    champ_main_img,
                    champ_img,
                })
                .execute()
        }
    } catch (err) {
        logger.error(err, { message: ` - from createNewChamp` })
    }
}

exports.saveChampInfoService = async (champId, champ_name_en, champ_name_ko, champ_main_img, champ_img) => {
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
exports.updateChampInfoService = async (champId, champ_main_img, champ_img) => {
    try {
        await ChampService.createQueryBuilder()
            .update(ChampService)
            .set({
                champ_img,
                champ_main_img,
            })
            .where("champId = :champId", { champId })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from updateChampInfoService` })
    }
}
