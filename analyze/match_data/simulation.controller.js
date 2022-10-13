require("dotenv").config()
const axios = require("axios")
const { taskErrLogging, taskSuccessLogging, matchIdLogging } = require("../../logging/log")
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
        await matchIdLogging('key 숫자', key, matchIdList.length, '매치데이터 조회 및 시뮬레이션 데이터 분석')
        while (key !== matchIdList.length) {
            if (status !== undefined) {
                status = undefined
                continue
            }
            await getMatchDataAndSaveSimulation(matchIdList)
        }
        await taskSuccessLogging('매치데이터 조회 및 시뮬레이션 데이터 분석')
        return "matchData 저장 성공"
    } catch (error) {
        console.log(error)
        await taskErrLogging(error, '매치데이터 조회 및 시뮬레이션 데이터 분석')
        return "matchData 저장 실패"
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
        console.log("team1", {
            team1top,
            team1jungle,
            team1middle,
            team1bottom,
            team1utility,
        })
        console.log("team2", {
            team2top,
            team2jungle,
            team2middle,
            team2bottom,
            team2utility,
        })
        // 탑 정글 넣기
        const existTopJungleSimulation = await checkSimulationData(
            team1top,
            team1jungle,
            team2top,
            team2jungle
        )
        const existMidJungleSimulation = await checkSimulationData(
            team1middle,
            team1jungle,
            team2middle,
            team2jungle
        )
        const existBottomDuoSimulation = await checkSimulationData(
            team1bottom,
            team1utility,
            team2bottom,
            team2utility
        )

        console.log(
            existBottomDuoSimulation.length,
            existTopJungleSimulation.length,
            existMidJungleSimulation.length
        )
        if (existTopJungleSimulation.length === 0) {
            await saveSimulationData(matchId, team1top, team1jungle, team2top, team2jungle, 0)
        } else {
            await updateSimulationData(matchId, team1top, team1jungle, team2top, team2jungle)
        }
        if (existMidJungleSimulation.length === 0) {
            await saveSimulationData(matchId, team1middle, team1jungle, team2middle, team2jungle, 1)
        } else {
            await updateSimulationData(matchId, team1middle, team1jungle, team2middle, team2jungle)
        }
        if (existBottomDuoSimulation.length === 0) {
            await saveSimulationData(
                matchId,
                team1bottom,
                team1utility,
                team2bottom,
                team2utility,
                2
            )
        } else {
            await updateSimulationData(
                matchId,
                team1bottom,
                team1utility,
                team2bottom,
                team2utility
            )
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
    console.log(`${key}번째 데이터 분석 끝`)
    return key++
}

exports.uploadSimulationWinRate = async () => {

    try {
        await matchIdLogging(0, '대전 시뮬레이션 로우데이터 승률로 변환')
        let data = await findRawSimulationData()
        console.log(data.length)
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
            }
            return value
        })
        for (let i = 0; i < data.length; i++) {
            const result = await updateSimulationWinRate(data[i])
            console.log(`${i}번째`, result)
        }
        await taskSuccessLogging('대전 시뮬레이션 로우데이터 승률로 변환')
        return "success"
    } catch (error) {
        console.log(error)
        await taskErrLogging(error, '대전 시뮬레이션 로우데이터 승률로 변환')
    }
}

exports.transferSimulationToServiceDB = async () => {
    try {
        await matchIdLogging(0, '대전 시뮬레이션 서비스 DB로 이관')
        const dataList = await getSimulationData()
        let result
        for (let data of dataList) {
            result = await transferToService_Simulation(data)
            console.log(result)
        }
        await taskSuccessLogging('대전 시뮬레이션 서비스 DB로 이관')
        return "success"
    } catch (error) {
        console.log(error)
        await taskErrLogging(error, '대전 시뮬레이션 서비스 DB로 이관')
    }
}