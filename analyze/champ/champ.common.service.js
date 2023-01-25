const { dataSource } = require("../../orm")
const { Brackets } = require("typeorm")

const MatchId = dataSource.getRepository("matchid")
const GameInfo = dataSource.getRepository("game_info")
const ChampRate = dataSource.getRepository("champ_rate")
const ChampBan = dataSource.getRepository("champ_ban")
const ChampSpell = dataSource.getRepository("champ_spell")

const { dataSource_service } = require("../../service.orm")
const GameInfoService = dataSource_service.getRepository("GAME_INFO")
const ChampRateService = dataSource_service.getRepository("CHAMP_RATE")
const ChampBanService = dataSource_service.getRepository("CHAMP_BAN")
const ChampSpellService = dataSource_service.getRepository("CHAMP_SPELL")
const logger = require("../../log")

//spell
exports.getSpellData = async () => {
    try {
        return await ChampSpell.createQueryBuilder().getMany()
    } catch (err) {
        logger.error(err, { message: ` - from getSpellData` })
    }
}
exports.saveChampSpellDataToService = async (champId, spell1, spell2, play_count, position, version) => {
    try {
        const serviceSpellData = await ChampSpellService.createQueryBuilder()
            .where("champId = :champId", { champId })
            .andWhere("spell1 = :spell1", { spell1 })
            .andWhere("spell2 = :spell2", { spell2 })
            .andWhere("position = :position", { position })
            .andWhere("version = :version", { version })
            .getOne()
        !serviceSpellData
            ? await ChampSpellService.createQueryBuilder()
                  .insert()
                  .values({ champId, spell1, spell2, play_count, position, version })
                  .execute()
            : await ChampSpellService.createQueryBuilder()
                  .update()
                  .set({ play_count })
                  .where("champId = :champId", { champId })
                  .andWhere("spell1 = :spell1", { spell1 })
                  .andWhere("spell2 = :spell2", { spell2 })
                  .andWhere("position = :position", { position })
                  .andWhere("version = :version", { version })
                  .execute()
    } catch (err) {
        logger.error(err, { message: ` - from saveChampSpellDataToService` })
    }
}
//ban
exports.getBanData = async () => {
    try {
        return await ChampBan.createQueryBuilder().getMany()
    } catch (err) {
        logger.error(err, { message: ` - from getBanData` })
    }
}
exports.saveChampBanDataToService = async (champId, ban_count, version) => {
    try {
        const serviceBanData = await ChampBanService.createQueryBuilder()
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .getOne()
        !serviceBanData
            ? await ChampBanService.createQueryBuilder().insert().values({ champId, ban_count, version }).execute()
            : await ChampBanService.createQueryBuilder()
                  .update()
                  .set({ ban_count })
                  .where("champId = :champId", { champId })
                  .andWhere("version = :version", { version })
                  .execute()
    } catch (err) {
        logger.error(err, { message: ` - from saveChampBanDataToService` })
    }
}
//rate
exports.getRateData = async () => {
    try {
        return await ChampRate.createQueryBuilder().getMany()
    } catch (err) {
        logger.error(err, { message: ` - from getRateData` })
    }
}
exports.saveChampRateDataToService = async (champId, win, lose, position, pick_count, version) => {
    try {
        const serviceRateData = await ChampRateService.createQueryBuilder()
            .where("champId = :champId", { champId })
            .andWhere("position = :position", { position })
            .andWhere("version = :version", { version })
            .getOne()
        !serviceRateData
            ? await ChampRateService.createQueryBuilder()
                  .insert()
                  .values({ champId, win, lose, position, pick_count, version })
                  .execute()
            : await ChampRateService.createQueryBuilder()
                  .update()
                  .set({ win, lose, pick_count })
                  .where("champId = :champId", { champId })
                  .andWhere("position = :position", { position })
                  .andWhere("version = :version", { version })
                  .execute()
    } catch (err) {
        logger.error(err, { message: ` - from saveChampRateDataToService` })
    }
}
//game
exports.getGameData = async () => {
    try {
        return await GameInfo.createQueryBuilder().getMany()
    } catch (err) {
        logger.error(err, { message: ` - from getGameData` })
    }
}
exports.saveGameDataToService = async (game_count, version) => {
    try {
        const serviceGameData = await GameInfoService.createQueryBuilder()
            .where("version = :version", { version })
            .getOne()
        !serviceGameData
            ? await GameInfoService.createQueryBuilder().insert().values({ game_count, version }).execute()
            : await GameInfoService.createQueryBuilder()
                  .update()
                  .set({ game_count })
                  .where("version = :version", { version })
                  .execute()
    } catch (err) {
        logger.error(err, { message: ` - from saveGameDataToService` })
    }
}

async function gameTotal(version) {
    return await GameInfo.createQueryBuilder().where("version = :version", { version }).getOne()
}

exports.winRate = async (champId, position, version) => {
    try {
        const winInfo = await ChampRate.createQueryBuilder()
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .andWhere("position = :position", { position })
            .select(["champ_rate.win", "champ_rate.pickCount"])
            .getOneOrFail()

        const winRate = (winInfo.win / winInfo.pickCount) * 100

        console.log(`승률: ${winRate.toFixed(2)}`)
    } catch (err) {
        logger.error(err, { message: ` - from winRate` })
    }
}
exports.banRate = async (champId, version) => {
    try {
        const gameInfo = await gameTotal(version)
        const banInfo = await ChampBan.createQueryBuilder()
            .where("champId = :champId", {
                champId,
            })
            .andWhere("version = :version", {
                version,
            })
            .select(["champ_ban.banCount"])
            .getOneOrFail()
        const banRate = (banInfo.banCount / gameInfo.gameCount) * 100
        console.log(`밴률: ${banRate.toFixed(2)}`)
    } catch (err) {
        logger.error(err, { message: ` - from winRate` })
    }
}
exports.pickRate = async (champId, position, version) => {
    try {
        const gameInfo = await gameTotal(version)
        const pickInfo = await ChampRate.createQueryBuilder()
            .where("champId = :champId", { champId })
            .andWhere("position = :position", { position })
            .andWhere("version = :version", { version })
            .select(["champ_rate.pickCount"])
            .getOneOrFail()
        const pickRate = (pickInfo.pickCount / gameInfo.gameCount) * 100
        console.log(`픽률: ${pickRate.toFixed(2)}`)
    } catch (err) {
        logger.error(err, { message: ` - from winRate` })
    }
}
exports.spellRate = async (champId, position, version) => {
    const spellInfo = await ChampSpell.createQueryBuilder()
        .where("champId = :champId", { champId })
        .andWhere("position = :position", { position })
        .andWhere("version = :version", { version })
        .select(["champ_spell.playCount playCount", "champ_spell.spell1", "champ_spell.spell2"])
        .addSelect("SUM(champ_spell.playCount) OVER(PARTITION BY champ_spell.champId) totalPlayCount")
        .orderBy("champ_spell.playCount", "DESC")
        .limit(1)
        .execute()

    const spellPickRate = (spellInfo[0].playCount / spellInfo[0].totalPlayCount) * 100
    console.log(`스펠 픽률: ${spellPickRate.toFixed(2)}`)

    try {
    } catch (err) {
        logger.error(err, { message: ` - from winRate` })
    }
}

exports.createOrIncreaseGameCount = async (version) => {
    try {
        const game = await GameInfo.findOneBy({ version })
        game
            ? await GameInfo.createQueryBuilder()
                  .update(GameInfo)
                  .set({ gameCount: () => "gameCount+1" })
                  .where("version = :version", { version: game.version })
                  .execute()
            : await GameInfo.createQueryBuilder().insert().values({ version, gameCount: 1 }).execute()
    } catch (err) {
        logger.error(err, { message: ` - from createOrIncreaseGameCount` })
    }
}

exports.createOrUpdateChampRate = async (champId, win, position, version) => {
    try {
        const existChamp = await ChampRate.createQueryBuilder()
            .where("champId = :champId", { champId })
            .andWhere("position = :position", { position })
            .andWhere("version = :version", { version })
            .getOne()

        if (win) {
            !existChamp
                ? await ChampRate.createQueryBuilder()
                      .insert()
                      .values({
                          champId,
                          win: 1,
                          position,
                          pickCount: 1,
                          version,
                      })
                      .execute()
                : await ChampRate.createQueryBuilder()
                      .update()
                      .set({
                          win: () => "win+1",
                          pickCount: () => "pickCount+1",
                      })
                      .where("champId = :champId", { champId })
                      .andWhere("position = :position", { position })
                      .andWhere("version = :version", { version })
                      .execute()
        } else if (!win) {
            !existChamp
                ? await ChampRate.createQueryBuilder()
                      .insert()
                      .values({
                          champId,
                          lose: 1,
                          position,
                          pickCount: 1,
                          version,
                      })
                      .execute()
                : await ChampRate.createQueryBuilder()
                      .update()
                      .set({
                          lose: () => "lose+1",
                          pickCount: () => "pickCount+1",
                      })
                      .where("champId = :champId", { champId })
                      .andWhere("position = :position", { position })
                      .andWhere("version = :version", { version })
                      .execute()
        }
    } catch (err) {
        logger.error(err, { message: ` - from createOrUpdateChampRate` })
    }
}
exports.createOrUpdateChampBan = async (champId, version) => {
    try {
        const existChamp = await ChampBan.createQueryBuilder()
            .where("champId = :champId", { champId })
            .andWhere("version = :version", { version })
            .getOne()

        !existChamp
            ? await ChampBan.createQueryBuilder().insert().values({ champId, banCount: 1, version }).execute()
            : await ChampBan.createQueryBuilder()
                  .update(ChampBan)
                  .set({ banCount: () => "banCount+1 " })
                  .where("champId = :champId", { champId })
                  .andWhere("version = :version", { version })
                  .execute()
    } catch (err) {
        logger.error(err, { message: ` - from createOrUpdateChampBan` })
    }
}

exports.createOrUpdateChampSpell = async (champId, spell1, spell2, position, version) => {
    try {
        const findSpell = await ChampSpell.createQueryBuilder()
            .where("champId = :champId", { champId })
            .andWhere("position = :position", { position })
            .andWhere("version = :version", { version })
            .andWhere(
                new Brackets((qb) => {
                    qb.where("spell1 = :spell1", { spell1 })
                        .andWhere("spell2 = :spell2", { spell2 })
                        .orWhere(
                            new Brackets((qb2) => {
                                qb2.where("spell1 = :spell2", {
                                    spell2,
                                }).andWhere("spell2 = :spell1", {
                                    spell1,
                                })
                            })
                        )
                })
            )
            .getOne()
        !findSpell
            ? await ChampSpell.createQueryBuilder()
                  .insert()
                  .values({
                      champId,
                      spell1,
                      spell2,
                      playCount: 1,
                      version,
                      position,
                  })
                  .execute()
            : await ChampSpell.createQueryBuilder()
                  .update()
                  .set({ playCount: () => "playCount+1" })
                  .where("champId = :champId", { champId })
                  .andWhere("position = :position", { position })
                  .andWhere("version = :version", { version })
                  .andWhere(
                      new Brackets((qb) => {
                          qb.where("spell1 = :spell1", { spell1 })
                              .andWhere("spell2 = :spell2", { spell2 })
                              .orWhere(
                                  new Brackets((qb2) => {
                                      qb2.where("spell1 = :spell2", {
                                          spell2,
                                      }).andWhere("spell2 = :spell1", {
                                          spell1,
                                      })
                                  })
                              )
                      })
                  )
                  .execute()
    } catch (err) {
        logger.error(err, { message: ` - from createOrUpdateChampSpell` })
    }
}

exports.matchIdList = async () => {
    try {
        return await MatchId.createQueryBuilder()
            .select()
            .where("champAnalyzed = :status", { status: 0 })
            .andWhere(
                new Brackets((qb) => {
                    qb.where("tier = :tier", { tier: "DIAMOND" }).orWhere("tier = :tier2", {
                        tier2: "PLATINUM",
                    })
                })
            )
            .orderBy("matchid.createdAt", "DESC")
            .limit(500)
            .getRawMany()
    } catch (err) {
        logger.error(err, { message: ` - from matchIdList` })
    }
}

exports.successAnalyzed = async (matchId) => {
    try {
        return await MatchId.createQueryBuilder()
            .update()
            .set({ champAnalyzed: 1 })
            .where("matchid.matchId = :matchId", { matchId })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from successAnalyzed` })
    }
}

exports.dropAnalyzed = async (matchId) => {
    try {
        return await MatchId.createQueryBuilder()
            .update()
            .set({ champAnalyzed: 2 })
            .where("matchid.matchId = :matchId", { matchId })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from dropAnalyzed` })
    }
}

exports.saveMatchIdVersion = async (matchId, version) => {
    try {
        return await MatchId.createQueryBuilder()
            .update()
            .set({ version })
            .where("matchid.matchId = :matchId", { matchId })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from saveMatchIdVersion` })
    }
}
