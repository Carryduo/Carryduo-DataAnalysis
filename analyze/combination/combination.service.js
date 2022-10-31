// 데이터분석 DB

const { dataSource } = require("../../orm")
const { dataSource_service } = require("../../service.orm")
const { Brackets, MoreThan } = require("typeorm")
const queryRunner = dataSource.createQueryRunner()

const MatchId = dataSource.getRepository("matchid")
const matchid = require("../../entity/match.id")

const Combination = dataSource.getRepository("combination")
const combination = require("../../entity/combination.data")

const Combination_Service = dataSource.getRepository("combination_service")
const combinationServiceData = require("../../entity/combination.service.data")
const logger = require("../../log")

// 서비스 DB
const combination_stat = dataSource_service.getRepository("COMBINATION_STAT")

// 매치 아이디 가져오기
exports.getMatchId = async () => {
    return await MatchId.createQueryBuilder()
        .select()
        .where(
            new Brackets((qb) => {
                qb.where("matchid.tier = :tier", {
                    tier: "PLATINUM",
                }).orWhere("matchid.tier = :tier2", {
                    tier2: "DIAMOND",
                })
            })
        )
        .andWhere("matchid.analyzed = :analyzed", {
            analyzed: 0,
        })
        .limit(500)
        .getMany()
}

exports.updateWrongMatchDataAnalyzed = async (matchId) => {
    try {
        await MatchId.createQueryBuilder()
            .update()
            .set({ analyzed: 2 })
            .where("matchid.matchId = :matchId", { matchId })
            .execute()
        console.log("무의미한 MatchData 처리 완료")
        return
    } catch (err) {
        logger.error(err, { message: 'from matchId 예외처리' })
    }
}

exports.getData = async (type) => {
    return await Combination_Service.createQueryBuilder()
        .select()
        .where("combination_service.category = :category", { category: type })
        .andWhere(
            new Brackets((qb3) => {
                qb3.where({
                    sample_num: MoreThan(9),
                })
            })
        )
        .orderBy({ "combination_service.rank_in_category": "ASC" })
        .limit(30)
        .getMany()
}

exports.checkCombinationData = async (mainChamp, subChamp, category, version) => {
    return await Combination.createQueryBuilder()
        .select()
        .where("combination.mainChampId = :mainChampId", { mainChampId: mainChamp.champId })
        .andWhere("combination.subChampId = :subChampId", { subChampId: subChamp.champId })
        .andWhere('combination.category = :category', { category })
        .andWhere('combination.version = :version', { version })
        .getMany()
}

// 챔피언 조합 승률 관련
exports.updateCombinationData = async (matchId, mainChamp, subChamp, category, type, version) => {
    // TODO: 트랜젝션, matchId 업데이트

    let dbupdate
    try {
        if (category === "win") {
            await Combination.createQueryBuilder()
                .update()
                .set({
                    win: () => "win + 1",
                    sampleNum: () => "sampleNum + 1",
                })
                .where("combination.mainChampId = :mainChampId", { mainChampId: mainChamp.champId })
                .andWhere("combination.subChampId = :subChampId", { subChampId: subChamp.champId })
                .andWhere('combination.category = :category', { category: type })
                .andWhere('combination.version = :version', { version })
                .execute()
            await MatchId.createQueryBuilder()
                .update()
                .set({ analyzed: 1, version })
                .where("matchid.matchId = :matchId", { matchId })
                .execute()
                .then(() => {
                    dbupdate = { message: `${matchId} 분석 성공` }
                })
        } else {
            await Combination.createQueryBuilder()
                .update()
                .set({
                    lose: () => "lose + 1",
                    sampleNum: () => "sampleNum + 1",
                })
                .where("combination.mainChampId = :mainChampId", { mainChampId: mainChamp.champId })
                .andWhere("combination.subChampId = :subChampId", { subChampId: subChamp.champId })
                .andWhere('combination.category = :category', { category: type })
                .andWhere('combination.version = :version', { version })
                .execute()

            await MatchId.createQueryBuilder()
                .update()
                .set({ analyzed: 1, version })
                .where("matchid.matchId = :matchId", { matchId })
                .execute()
                .then(() => {
                    dbupdate = { message: `${matchId} 분석 성공` }
                })
        }

    } catch (err) {
        dbupdate = { message: `${matchId} 분석 실패` }
        logger.error(err, { message: `-from ${matchId} 챔피언 조합승률 분석(update)` })
    } finally {
        return dbupdate
    }
}

exports.saveCombinationData = async (matchId, mainChamp, subChamp, category, type, version) => {

    let dbupdate
    try {
        if (category === "win") {
            await Combination.createQueryBuilder()
                .insert()
                .values({
                    matchId,
                    mainChampId: mainChamp.champId,
                    mainChampName: mainChamp.champName,
                    subChampId: subChamp.champId,
                    subChampName: subChamp.champName,
                    win: 1,
                    lose: 0,
                    sampleNum: 1,
                    category: type,
                    version
                })
                .execute()
            await MatchId.createQueryBuilder()
                .update()
                .set({ analyzed: 1, version })
                .where("matchid.matchId = :matchId", { matchId })
                .execute()
                .then(() => {
                    dbupdate = { message: `${matchId} 분석 성공` }
                })
        } else {
            await Combination.createQueryBuilder()
                .insert()
                .values({
                    matchId,
                    mainChampId: mainChamp.champId,
                    mainChampName: mainChamp.champName,
                    subChampId: subChamp.champId,
                    subChampName: subChamp.champName,
                    win: 0,
                    lose: 1,
                    sampleNum: 1,
                    category: type,
                    version
                })
                .execute()
            await MatchId.createQueryBuilder()
                .update()
                .set({ analyzed: 1, version })
                .where("matchid.matchId = :matchId", { matchId })
                .execute()
                .then(() => {
                    dbupdate = { message: `${matchId} 분석 성공` }
                })
        }
    } catch (err) {
        logger.error(err, { message: `-from ${matchId} 챔피언 조합승률 분석(update)` })
        dbupdate = { message: `${matchId} 분석 실패` }
    } finally {
        return dbupdate
    }
}

exports.findRawCombinationData = async () => {
    try {
        let data = await Combination.createQueryBuilder().select().getMany()
        return data
    } catch (err) {
        logger.error(err, { message: `챔피언 조합 승률 로우데이터 조회 실패(승률 변환)` })
    }
}

exports.updateWinRate = async (value) => {
    let type
    try {
        const existData = await Combination_Service.createQueryBuilder()
            .select()
            .where("combination_service.mainChampId = :mainChampId", {
                mainChampId: value.mainChampId,
            })
            .andWhere("combination_service.subChampId = :subChampId", {
                subChampId: value.subChampId,
            })
            .andWhere('combination_service.version = :version', {
                version: value.version
            })
            .getOne()

        if (!existData) {
            await Combination_Service.createQueryBuilder().insert().values(value).execute()
            type = "save"
        } else {
            await Combination_Service.createQueryBuilder()
                .update()
                .set(value)
                .where("combination_service.mainChampId = :mainChampId", {
                    mainChampId: value.mainChampId,
                })
                .andWhere("combination_service.subChampId = :subChampId", {
                    subChampId: value.subChampId,
                })
                .andWhere('combination_service.version = :version', {
                    version: value.version
                })
                .execute()
            type = "update"
        }

        return { type, success: true }
    } catch (err) {
        logger.error(err, { message: `챔피언 조합 승률 변환 실패(승률 변환)` })
        return { type, success: false }
    }
}

exports.findVersion = async () => {
    try {
        return await Combination_Service.createQueryBuilder().select(['distinct combination_service.version']).getRawMany()
    } catch (err) {
        logger.error(err, { message: '챔피언 조합 승률 카테고리별 승률 데이터 조회 시 패치버전 조회 실패' })
    }
}
exports.findCombinationCleansedData = async (version) => {
    try {
        const category0 = await Combination_Service.createQueryBuilder()
            .where("combination_service.category = :category", { category: 0 })
            .andWhere('combination_service.version = :version', { version })
            .select()
            .getMany()
        const category1 = await Combination_Service.createQueryBuilder()
            .where("combination_service.category = :category", { category: 1 })
            .andWhere('combination_service.version = :version', { version })
            .select()
            .getMany()
        const category2 = await Combination_Service.createQueryBuilder()
            .where("combination_service.category = :category", { category: 2 })
            .andWhere('combination_service.version = :version', { version })
            .select()
            .getMany()
        return { category0, category1, category2 }
    } catch (err) {
        logger.error(err, { message: `챔피언 조합 승률 카테고리별 승률 데이터 조회 실패` })

    }
}

exports.updateCombinationTier = async (value) => {
    try {
        await Combination_Service.createQueryBuilder()
            .update()
            .set(value)
            .where("combination_service.mainChampId = :mainChampId", {
                mainChampId: value.mainChampId,
            })
            .andWhere("combination_service.subChampId = :subChampId", {
                subChampId: value.subChampId,
            })
            .andWhere('combination_service.version = :version', { version: value.version })
            .execute()
    } catch (err) {
        logger.error(err, { message: `챔피언 조합 승률 티어, 랭크 삽입 실패` })
    }
}

exports.getCombinationData = async () => {
    try {
        return Combination_Service.createQueryBuilder()
            .select([
                "combination_service.tier",
                "combination_service.category",
                "combination_service.rank_in_category",
                "combination_service.winrate",
                "combination_service.sample_num",
                "combination_service.mainChampId",
                "combination_service.subChampId",
                'combination_service.version'
            ])
            .getMany()
    } catch (error) {
        logger.error(err, { message: `챔피언 조합승률 데이터 조회 실패(서비스DB 이관)` })
    }
}

exports.transferToService = async (data) => {
    try {
        let result = { type: "none", success: "none" }
        const existData = await combination_stat
            .createQueryBuilder()
            .select()
            .where("COMBINATION_STAT.mainChampId = :mainChampId", { mainChampId: data.mainChampId })
            .andWhere("COMBINATION_STAT.subChampId = :subChampId", { subChampId: data.subChampId })
            .andWhere("COMBINATION_STAT.category = :category", { category: data.category })
            .andWhere('COMBINATION_STAT.version = :version', { version: data.version })
            .getMany()
        if (existData.length === 0) {
            result.type = "save"
            result.success = await combination_stat
                .createQueryBuilder()
                .insert()
                .values(data)
                .execute()
                .then(() => {
                    return { success: true }
                })
                .catch((error) => {
                    console.log(error)
                    return { success: false }
                })
        } else {
            result.type = "update"
            result.success = await combination_stat
                .createQueryBuilder()
                .update()
                .set(data)
                .where("COMBINATION_STAT.mainChampId = :mainChampId", {
                    mainChampId: data.mainChampId,
                })
                .andWhere("COMBINATION_STAT.subChampId = :subChampId", {
                    subChampId: data.subChampId,
                })
                .andWhere("COMBINATION_STAT.category = :category", { category: data.category })
                .andWhere('COMBINATION_STAT.version = :version', { version: data.version })
                .execute()
                .then(() => {
                    return { success: true }
                })
                .catch((error) => {
                    console.log(error)
                    return { success: false }
                })
        }
        return result
    } catch (err) {
        logger.error(err, { message: '챔피언 조합 승률 서비스 DB 이관 실패' })
    }
}

exports.findVersionAndMatchId = async () => {
    return await Combination.createQueryBuilder().select(['combination.matchId', 'combination.version']).getMany()
}

exports.transferVersiontoMatchId = async (matchId, version) => {
    try {
        await MatchId.createQueryBuilder()
            .update()
            .set({ version })
            .where("matchid.matchId = :matchId", { matchId })
            .execute()
    } catch (err) {
        console.log(err)
    }
}
exports.disconnect = async () => {
    await queryRunner.release()
}