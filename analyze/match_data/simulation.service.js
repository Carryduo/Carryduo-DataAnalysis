const { dataSource, dataSource_service } = require("../../orm")
const queryRunner = dataSource.createQueryRunner()
const Simulation = dataSource.getRepository('simulation')
const simulation = require('../../entity/simulation.data')
const { Brackets, MoreThan } = require("typeorm")


exports.updateWrongMatchDataSimulationAnalyzed = async (matchId) => {
    await MatchId.createQueryBuilder().update().set({ simulationAnalyzed: 2 }).where('matchid.matchId = :matchId', { matchId }).execute()
    console.log('무의미한 MatchData 처리 완료')
    return
}

exports.checkSimulationData = async (champ1, champ2, champ3, champ4) => {
    return await Simulation.createQueryBuilder()
        .select()
        .where("simulation.champ1Id = :champ1Id", { champ1Id: champ1.champId })
        .andWhere("simulation.champ2Id = :champ2Id", { champ2Id: champ2.champId })
        .andWhere("simulation.champ3Id = :champ3Id", { champ3Id: champ3.champId })
        .andWhere("simulation.champ4Id = :champ4Id", { champ4Id: champ4.champId })
        .getMany()
}

// 챔피언 조합 승률 관련
exports.updateCombinationData = async (matchId, mainChamp, subChamp, category) => {
    // TODO: 트랜젝션, matchId 업데이트
    console.log("update", mainChamp, subChamp)

    let dbupdate
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        if (category === "win") {
            await queryRunner.manager
                .createQueryBuilder()
                .update(combination)
                .set({
                    win: () => "win + 1",
                    sampleNum: () => "sampleNum + 1",
                })
                .where("combination.mainChampId = :mainChampId", { mainChampId: mainChamp.champId })
                .andWhere("combination.subChampId = :subChampId", { subChampId: subChamp.champId })
                .execute()
            await queryRunner.manager
                .createQueryBuilder()
                .update(matchid)
                .set({ analyzed: 1 })
                .where("matchid.matchId = :matchId", { matchId })
                .execute()
                .then(() => {
                    dbupdate = { message: `${matchId} 분석 성공` }
                })
        } else {
            await queryRunner.manager
                .createQueryBuilder()
                .update(combination)
                .set({
                    lose: () => "lose + 1",
                    sampleNum: () => "sampleNum + 1",
                })
                .where("combination.mainChampId = :mainChampId", { mainChampId: mainChamp.champId })
                .andWhere("combination.subChampId = :subChampId", { subChampId: subChamp.champId })
                .execute()

            await queryRunner.manager
                .createQueryBuilder()
                .update(matchid)
                .set({ analyzed: 1 })
                .where("matchid.matchId = :matchId", { matchId })
                .execute()
                .then(() => {
                    dbupdate = { message: `${matchId} 분석 성공` }
                })
        }

        await queryRunner.commitTransaction()
    } catch (error) {
        dbupdate = { message: `${matchId} 분석 실패` }
        console.log(error)
        await queryRunner.rollbackTransaction()
    } finally {
        return dbupdate
    }
}

exports.saveSimulationData = async (matchId, champ1, champ2, champ3, champ4, category, type) => {
    console.log("save", mainChamp, subChamp, matchId)

    let dbupdate
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
        if (category === "win") {
            await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into(simulation)
                .values({
                    matchId,
                    champ1Id: champ1.champId,
                    champ2Id: champ1.champId,
                    champ3Id: champ1.champId,
                    champ4Id: champ1.champId,
                    win: 1,
                    lose: 0,
                    sampleNum: 1,
                    category: type,
                })
                .execute()
            await queryRunner.manager
                .createQueryBuilder()
                .update(matchid)
                .set({ simulationAnalyzed: 1 })
                .where("matchid.matchId = :matchId", { matchId })
                .execute()
                .then(() => {
                    dbupdate = { message: `${matchId} 분석 성공` }
                })
        } else {
            await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into(combination)
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
                })
                .execute()
            await queryRunner.manager
                .createQueryBuilder()
                .update(matchid)
                .set({ analyzed: 1 })
                .where("matchid.matchId = :matchId", { matchId })
                .execute()
                .then(() => {
                    dbupdate = { message: `${matchId} 분석 성공` }
                })
        }
        await queryRunner.commitTransaction()
    } catch (error) {
        console.log(error)
        dbupdate = { message: `${matchId} 분석 실패` }
        await queryRunner.rollbackTransaction()
    } finally {
        return dbupdate
    }
}