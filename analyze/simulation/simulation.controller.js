require("dotenv").config()
const axios = require("axios")
const logger = require("../../log")
const { sleep } = require("../../timer/timer")
const {
    getMatchId,
    updateWrongMatchDataSimulationAnalyzed,
    checkSimulationData,
    saveSimulationData,
    updateSimulationData,
    findRawSimulationData,
    updateSimulationWinRate,
    getSimulationData,
    transferToService_Simulation,
} = require("./simulation.service")
let key = 0
let status
exports.saveSimulation = async () => {
    try {
        const matchIdList = await getMatchId()
        logger.info(matchIdList.length, { message: "매치데이터 조회 및 시뮬레이션 데이터 분석 matchId 개수" })
        while (key !== matchIdList.length) {
            if (status !== undefined) {
                status = undefined
                continue
            }
            await getMatchDataAndSaveSimulation(matchIdList)
        }
        logger.info("매치데이터 조회 및 시뮬레이션 데이터 분석")
        key = 0
        return
    } catch (err) {
        logger.error(err, { message: "-from 매치데이터 조회 및 시뮬레이션 데이터 분석" })
        return
    }
}

async function getMatchDataAndSaveSimulation(matchIdList) {
    try {
        const matchId = matchIdList[key].matchId
        const tier = matchIdList[key].tier
        const division = matchIdList[key].division
        console.log(`${key}번째 데이터 분석 시작`, matchId, tier, division)
        const matchDataApiUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${process.env.KEY}`
        const response = await axios.get(matchDataApiUrl)
        const matchData = response.data
        if (matchData.info.gameMode !== "CLASSIC") {
            // TODO: 수정해야함
            await updateWrongMatchDataSimulationAnalyzed(matchId)
            console.log("게임 모드가 CLASSIC이 아닙니다")
            return key++
        }
        if (matchData.info.queueId !== 420) {
            await updateWrongMatchDataSimulationAnalyzed(matchId)
            console.log("게임 모드가 솔로랭크가 아닙니다")
            return key++
        }
        let version = matchData.info.gameVersion.substr(0, 5)
        let team1top, team1jungle, team1middle, team1bottom, team1utility
        let team2jungle, team2middle, team2top, team2bottom, team2utility
        for (let i = 0; i < matchData.info.participants.length; i++) {
            const teamId = matchData.info.participants[i].teamId
            const win = matchData.info.participants[i].win
            let position = matchData.info.participants[i].teamPosition
            if (position === undefined) {
                continue
            }
            if (teamId === 100) {
                switch (position) {
                    case "MIDDLE":
                        team1middle = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win,
                        }
                        break
                    case "TOP":
                        team1top = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win,
                        }
                        break
                    case "BOTTOM":
                        team1bottom = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win,
                        }
                        break
                    case "UTILITY":
                        team1utility = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win,
                        }
                        break
                    case "JUNGLE":
                        team1jungle = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win,
                        }
                        break
                }
            } else {
                switch (position) {
                    case "MIDDLE":
                        team2middle = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win,
                        }
                        break
                    case "TOP":
                        team2top = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win,
                        }
                        break
                    case "BOTTOM":
                        team2bottom = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win,
                        }
                        break
                    case "UTILITY":
                        team2utility = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win,
                        }
                        break
                    case "JUNGLE":
                        team2jungle = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win,
                        }
                        break
                }
            }
        }
        if (
            !team1top ||
            !team1jungle ||
            !team1middle ||
            !team1bottom ||
            !team1utility ||
            !team2top ||
            !team2jungle ||
            !team2bottom ||
            !team2middle ||
            !team2utility
        ) {
            console.log("@@@@@@@@@@@@@@@@@여기서 멈췄어")
            // TODO: simulationAnalyzed로 바꾸기
            await updateWrongMatchDataAnalyzed(matchId)
            return key++
        }
        // 탑 정글 넣기
        const existTopJungleSimulation = await checkSimulationData(team1top, team1jungle, team2top, team2jungle, version)
        const existMidJungleSimulation = await checkSimulationData(team1middle, team1jungle, team2middle, team2jungle, version)
        const existBottomDuoSimulation = await checkSimulationData(team1bottom, team1utility, team2bottom, team2utility, version)
        if (existTopJungleSimulation.length === 0) {
            await saveSimulationData(matchId, team1top, team1jungle, team2top, team2jungle, 0, version)
        } else {
            await updateSimulationData(matchId, team1top, team1jungle, team2top, team2jungle, 0, version)
        }
        if (existMidJungleSimulation.length === 0) {
            await saveSimulationData(matchId, team1middle, team1jungle, team2middle, team2jungle, 1, version)
        } else {
            await updateSimulationData(matchId, team1middle, team1jungle, team2middle, team2jungle, 1, version)
        }
        if (existBottomDuoSimulation.length === 0) {
            await saveSimulationData(matchId, team1bottom, team1utility, team2bottom, team2utility, 2, version)
        } else {
            await updateSimulationData(matchId, team1bottom, team1utility, team2bottom, team2utility, 2, version)
        }
    } catch (err) {
        if (!err.response) {
            console.log("라이엇으로부터 err.response가 없다! ")
            console.log(key + " 번째 부터 오류!")
            return key++
        }
        if (err.response.status === 429) {
            console.log("라이엇 요청 제한 경고!")
            console.log(key + " 번째 부터 오류!")
            await sleep(125)
            return
        } else if (err.response.status === 403) {
            console.log("api키 갱신 필요!")
            return
        } else {
            console.log(err.response.status, err.response.statusText)
            status = err.response.status
            return key++
        }
    }
    console.log(`${key}번째 시뮬레이션 데이터 분석 끝`)
    return key++
}

exports.uploadSimulationWinRate = async () => {
    try {
        let data = await findRawSimulationData()
        logger.info(data.length, { message: "대전 시뮬레이션 로우데이터 승률로 변환" })
        data = data.map((value) => {
            value = {
                winrate: value.win / value.sampleNum,
                champ1Id: value.champ1Id,
                champ2Id: value.champ2Id,
                champ3Id: value.champ3Id,
                champ4Id: value.champ4Id,
                champ1Name: value.champ1Name,
                champ2Name: value.champ2Name,
                champ3Name: value.champ3Name,
                champ4Name: value.champ4Name,
                category: value.category,
                sample_num: value.sampleNum,
                version: value.version,
            }
            return value
        })
        for (let i = 0; i < data.length; i++) {
            const result = await updateSimulationWinRate(data[i])
            console.log(`${i}번째 대전 시뮬레이션 로우데이터 승률로 변환 완료`)
        }
        logger.info("대전 시뮬레이션 로우데이터 승률로 변환 완료")
    } catch (err) {
        logger.error(err, { message: "-from 대전 시뮬레이션 로우데이터 승률로 변환" })
    }
}

exports.transferSimulationToServiceDB = async () => {
    try {
        const dataList = await getSimulationData()
        logger.info(dataList.length, { message: "대전 시뮬레이션 서비스 DB로 이관" })
        let result
        for (let i = 0; i < dataList.length; i++) {
            await transferToService_Simulation(dataList[i])
            console.log(`${i}번째 시뮬레이션 데이터 서비스 DB로 이관`)
        }
        logger.info("대전 시뮬레이션 서비스 DB로 이관 완료")
        return
    } catch (err) {
        logger.error(err, { message: "-from 대전 시뮬레이션 서비스 DB로 이관" })
    }
}
