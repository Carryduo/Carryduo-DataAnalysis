require("dotenv").config()
const axios = require("axios")
const { sleep } = require("../../timer")
const {
    getMatchId,
    updateWrongMatchDataAnalyzed,
} = require("./match.data.service")

const { updateWrongMatchDataSimulationAnalyzed } = require('./simulation.service')
let key = 0
let status
exports.saveSimulation = async (req, res, next) => {
    try {
        const matchIdList = await getMatchId()
        console.log(matchIdList.length)
        while (key !== matchIdList.length) {
            if (status !== undefined) {
                status = undefined
                continue
            }
            await getMatchDataAndSaveCombination(matchIdList)
        }
        return "matchData 저장 성공"
    } catch (error) {
        console.log(error)
        return "matchData 저장 실패"
    }
}

async function getMatchDataAndSaveCombination(matchIdList) {
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
                            win
                        }
                        break
                    case "TOP":
                        team1top = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win
                        }
                        break
                    case "BOTTOM":
                        team1bottom = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win
                        }
                        break
                    case "UTILITY":
                        team1utility = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win
                        }
                        break
                    case "JUNGLE":
                        team1jungle = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win
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
                            win
                        }
                        break
                    case "TOP":
                        team2top = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win
                        }
                        break
                    case "BOTTOM":
                        team2bottom = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win
                        }
                        break
                    case "UTILITY":
                        team2utility = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win
                        }
                        break
                    case "JUNGLE":
                        team2jungle = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                            win
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
            team1utility
        })
        console.log("team2", {
            team2top,
            team2jungle,
            team2middle,
            team2bottom,
            team2utility,
        })
        // 탑 정글 넣기
        // TODO: matchData 기준인거 matchId 버전으로 수정
        // const existWinTopJungle = await checkCombinationData(wintop, winjungle)
        // const existWinMidJungle = await checkCombinationData(winmiddle, winjungle)
        // const existWinBottomDuo = await checkCombinationData(winbottom, winutility)

        // const existLoseTopJungle = await checkCombinationData(losetop, losejungle)
        // const existLoseMidJungle = await checkCombinationData(losemiddle, losejungle)
        // const existLoseBottomDuo = await checkCombinationData(losebottom, loseutility)
        // console.log(matchId)
        // if (existWinTopJungle.length === 0) {
        //     await saveCombinationData(matchId, wintop, winjungle, "win", 0)
        // } else {
        //     await updateCombinationData(matchId, wintop, winjungle, "win")
        // }
        // if (existWinMidJungle.length === 0) {
        //     await saveCombinationData(matchId, winmiddle, winjungle, "win", 1)
        // } else {
        //     await updateCombinationData(matchId, winmiddle, winjungle, "win")
        // }
        // if (existWinBottomDuo.length === 0) {
        //     await saveCombinationData(matchId, winbottom, winutility, "win", 2)
        // } else {
        //     await updateCombinationData(matchId, winbottom, winutility, "win")
        // }

        // if (existLoseTopJungle.length === 0) {
        //     await saveCombinationData(matchId, losetop, losejungle, "lose", 0)
        // } else {
        //     await updateCombinationData(matchId, losetop, losejungle, "lose")
        // }
        // if (existLoseMidJungle.length === 0) {
        //     await saveCombinationData(matchId, losemiddle, losejungle, "lose", 1)
        // } else {
        //     await updateCombinationData(matchId, losemiddle, losejungle, "lose")
        // }
        // if (existLoseBottomDuo.length === 0) {
        //     await saveCombinationData(matchId, losebottom, loseutility, "lose", 2)
        // } else {
        //     await updateCombinationData(matchId, losebottom, loseutility, "lose")
        // }
    } catch (err) {
        // const result = await saveMatchData(response.data, tier, division, matchId)
        // console.log(result)
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