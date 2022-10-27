const { dataSource } = require("../../orm")
const { dataSource_service } = require("../../service.orm")
const queryRunner = dataSource.createQueryRunner()
const Simulation = dataSource.getRepository("simulation")
const Simulation_service = dataSource.getRepository("simulation_service")
const simulation = require("../../entity/simulation.data")
const matchid = require("../../entity/match.id")
const MatchId = dataSource.getRepository("matchid")
const { Brackets } = require("typeorm")
const logger = require("../../log")
const Simulation_serviceDB = dataSource_service.getRepository("SIMULATION")

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
        .andWhere("matchid.simulationanalyzed = :simulationAnalyzed", {
            simulationAnalyzed: 0,
        })
        .limit(500)
        .getMany()
}

exports.updateWrongMatchDataSimulationAnalyzed = async (matchId) => {
    await MatchId.createQueryBuilder()
        .update()
        .set({ simulationAnalyzed: 2 })
        .where("matchid.matchId = :matchId", { matchId })
        .execute()
    console.log("무의미한 MatchData 처리 완료")
    return
}

exports.checkSimulationData = async (champ1, champ2, champ3, champ4, version) => {
    return await Simulation.createQueryBuilder()
        .select()
        .where("simulation.champ1Id = :champ1Id", { champ1Id: champ1.champId })
        .andWhere("simulation.champ2Id = :champ2Id", { champ2Id: champ2.champId })
        .andWhere("simulation.champ3Id = :champ3Id", { champ3Id: champ3.champId })
        .andWhere("simulation.champ4Id = :champ4Id", { champ4Id: champ4.champId })
        .andWhere('simulation.version = :version', { version })
        .getMany()
}

// 챔피언 조합 승률 관련
exports.updateSimulationData = async (matchId, champ1, champ2, champ3, champ4, category, version) => {
    // TODO: 트랜젝션, matchId 업데이트
    const win = champ1.win

    let dbupdate
    try {
        if (win) {
            await Simulation.createQueryBuilder()
                .update()
                .set({
                    win: () => "win + 1",
                    sampleNum: () => "sampleNum + 1",
                })
                .where("simulation.champ1Id = :champ1Id", { champ1Id: champ1.champId })
                .andWhere("simulation.champ2Id = :champ2Id", { champ2Id: champ2.champId })
                .andWhere("simulation.champ3Id = :champ3Id", { champ3Id: champ3.champId })
                .andWhere("simulation.champ4Id = :champ4Id", { champ4Id: champ4.champId })
                .andWhere('simulation.category = :category', { category })
                .andWhere('simulation.version = :version', { version })
                .execute()
            await MatchId.createQueryBuilder()
                .update()
                .set({ simulationAnalyzed: 1 })
                .where("matchid.matchId = :matchId", { matchId })
                .execute()
                .then(() => {
                    dbupdate = { message: `${matchId} 분석 성공` }
                })
        } else {
            await Simulation.createQueryBuilder()
                .update()
                .set({
                    lose: () => "lose + 1",
                    sampleNum: () => "sampleNum + 1",
                })
                .where("simulation.champ1Id = :champ1Id", { champ1Id: champ1.champId })
                .andWhere("simulation.champ2Id = :champ2Id", { champ2Id: champ2.champId })
                .andWhere("simulation.champ3Id = :champ3Id", { champ3Id: champ3.champId })
                .andWhere("simulation.champ4Id = :champ4Id", { champ4Id: champ4.champId })
                .andWhere('simulation.category = :category', { category })
                .andWhere('simulation.version = :version', { version })
                .execute()

            await MatchId.createQueryBuilder()
                .update()
                .set({ simulationAnalyzed: 1 })
                .where("matchid.matchId = :matchId", { matchId })
                .execute()
                .then(() => {
                    dbupdate = { message: `${matchId} 분석 성공` }
                })
        }
    } catch (err) {
        dbupdate = { message: `${matchId} 분석 실패` }
        logger.error(err, { message: `${matchId} simulation 분석 실패(update)` })
    } finally {
        return dbupdate
    }
}

exports.saveSimulationData = async (matchId, champ1, champ2, champ3, champ4, category, version) => {

    const win = champ1.win
    let dbupdate
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        if (win) {
            await Simulation.createQueryBuilder()
                .insert()
                .values({
                    matchId,
                    champ1Id: champ1.champId,
                    champ2Id: champ2.champId,
                    champ3Id: champ3.champId,
                    champ4Id: champ4.champId,
                    champ1Name: champ1.champName,
                    champ2Name: champ2.champName,
                    champ3Name: champ3.champName,
                    champ4Name: champ4.champName,
                    win: 1,
                    lose: 0,
                    sampleNum: 1,
                    category,
                    version
                })
                .execute()
            await MatchId.createQueryBuilder()
                .update(matchid)
                .set({ simulationAnalyzed: 1 })
                .where("matchid.matchId = :matchId", { matchId })
                .execute()
                .then(() => {
                    dbupdate = { message: `${matchId} 분석 성공` }
                })
        } else {
            await Simulation.createQueryBuilder()
                .insert()
                .values({
                    matchId,
                    champ1Id: champ1.champId,
                    champ2Id: champ2.champId,
                    champ3Id: champ3.champId,
                    champ4Id: champ4.champId,
                    champ1Name: champ1.champName,
                    champ2Name: champ2.champName,
                    champ3Name: champ3.champName,
                    champ4Name: champ4.champName,
                    win: 0,
                    lose: 1,
                    sampleNum: 1,
                    category,
                    version
                })
                .execute()
            await MatchId.createQueryBuilder()
                .update()
                .set({ simulationAnalyzed: 1 })
                .where("matchid.matchId = :matchId", { matchId })
                .execute()
                .then(() => {
                    dbupdate = { message: `${matchId} 분석 성공` }
                })
        }
        await queryRunner.commitTransaction()
    } catch (err) {
        logger.error(err, { message: `${matchId} simulation 분석 실패(update)` })
        dbupdate = { message: `${matchId} 분석 실패` }
        await queryRunner.rollbackTransaction()
    } finally {
        return dbupdate
    }
}

exports.findRawSimulationData = async () => {
    let data = await Simulation.createQueryBuilder().select().orderBy({ "simulation.version": "ASC" }).getMany()
    return data
}

exports.updateSimulationWinRate = async (value) => {
    let type
    try {
        const existData = await Simulation_service.createQueryBuilder()
            .select()
            .where("simulation_service.champ1Id = :champ1Id", { champ1Id: value.champ1Id })
            .andWhere("simulation_service.champ2Id = :champ2Id", { champ2Id: value.champ2Id })
            .andWhere("simulation_service.champ3Id = :champ3Id", { champ3Id: value.champ3Id })
            .andWhere("simulation_service.champ4Id = :champ4Id", { champ4Id: value.champ4Id })
            .andWhere("simulation_service.category = :category", { version: value.category })
            .andWhere("simulation_service.version = :version", { version: value.version })
            .getOne()

        if (!existData) {
            await Simulation_service.createQueryBuilder().insert().values(value).execute()
            type = "save"
        } else {
            await Simulation_service.createQueryBuilder()
                .update()
                .set(value)
                .where("simulation_service.champ1Id = :champ1Id", { champ1Id: value.champ1Id })
                .andWhere("simulation_service.champ2Id = :champ2Id", { champ2Id: value.champ2Id })
                .andWhere("simulation_service.champ3Id = :champ3Id", { champ3Id: value.champ3Id })
                .andWhere("simulation_service.champ4Id = :champ4Id", { champ4Id: value.champ4Id })
                .andWhere("simulation_service.category = :category", { version: value.category })
                .andWhere("simulation_service.version = :version", { version: value.version })
                .execute()
            type = "update"
        }

        return { type, success: true }
    } catch (err) {
        logger.error(err, { message: `시뮬레이션 데이터 승률 변환 실패` })
        return { type, success: false }
    }
}

exports.getSimulationData = async () => {
    return Simulation_service.createQueryBuilder()
        .select([
            "simulation_service.category",
            "simulation_service.winrate",
            "simulation_service.sample_num",
            "simulation_service.champ1Id",
            "simulation_service.champ2Id",
            "simulation_service.champ3Id",
            "simulation_service.champ4Id",
            "simulation_service.version"
        ])
        .getMany()
}

exports.transferToService_Simulation = async (data) => {
    let result = { type: "none", success: "none" }
    const existData = await Simulation_serviceDB.createQueryBuilder()
        .select()
        .where("SIMULATION.champ1Id = :champ1Id", { champ1Id: data.champ1Id })
        .andWhere("SIMULATION.champ2Id = :champ2Id", { champ2Id: data.champ2Id })
        .andWhere("SIMULATION.champ3Id = :champ3Id", { champ3Id: data.champ3Id })
        .andWhere("SIMULATION.champ4Id = :champ4Id", { champ4Id: data.champ4Id })
        .andWhere('SIMULATION.category = :category', { category: data.category })
        .andWhere('SIMULATION.version = :version', { version: data.version })
        .getMany()
    if (existData.length === 0) {
        result.type = "save"
        result.success = await Simulation_serviceDB.createQueryBuilder()
            .insert()
            .values(data)
            .execute()

            .then(() => {
                return { success: true }
            })
            .catch((err) => {
                logger.error(err, { message: `시뮬레이션 데이터 서비스 DB 이관 실패(save)` })
                return { success: false }
            })
    } else {
        result.type = "update"
        result.success = await Simulation_serviceDB.createQueryBuilder()
            .update()
            .set(data)
            .where("SIMULATION.champ1Id = :champ1Id", { champ1Id: data.champ1Id })
            .andWhere("SIMULATION.champ2Id = :champ2Id", { champ2Id: data.champ2Id })
            .andWhere("SIMULATION.champ3Id = :champ3Id", { champ3Id: data.champ3Id })
            .andWhere("SIMULATION.champ4Id = :champ4Id", { champ4Id: data.champ4Id })
            .andWhere('SIMULATION.category = :category', { category: data.category })
            .andWhere('SIMULATION.version = :version', { version: data.version })
            .execute()
            .then(() => {
                return { success: true }
            })
            .catch((err) => {
                logger.error(err, { message: `시뮬레이션 데이터 서비스 DB 이관 실패(update)` })
                return { success: false }
            })
    }
    return result
}
