require("dotenv").config()
const axios = require("axios")
const logger = require("../../log")
const { sleep } = require("../../timer/timer")
const {
    getMatchId,
    saveCombinationData,
    checkCombinationData,
    updateCombinationData,
    updateWinRate,
    findRawCombinationData,
    findCombinationCleansedData,
    updateCombinationTier,
    getCombinationData,
    transferToService,
    updateWrongMatchDataAnalyzed,
    findVersion,
    findVersionAndMatchId,
    transferVersiontoMatchId,
    checkRank,
    updateNotRankedData
} = require("./combination.service")

let key = 0
let status


exports.transferCombinationStatToServiceDB = async (req, res, next) => {
    try {
        logger.info('챔피언 조합 승률 데이터 서비스 DB로 이관')
        const dataList = await getCombinationData()
        for (let i = 0; i < dataList.length; i++) {
            const data = await transferToService(dataList[i])
            console.log(data)
            //     // console.log(`${i}번째 챔피언 조합 승률 데이터 서비스 DB로 이관 완료`)
        }
        logger.info('챔피언 조합 승률 데이터 서비스 DB로 이관')
    }
    catch (err) {
        logger.error(err, { message: '챔피언 조합 승률 데이터 서비스 DB로 이관' })
    }
}

// TODO: 테스트 --------------------------------------------------------------
exports.saveCombination = async (req, res, next) => {
    try {
        const matchIdList = await getMatchId()
        logger.info(matchIdList.length, { message: " - 매치데이터 조회 및 챔피언 조합 승률 분석 matchId 개수" })
        while (key !== matchIdList.length) {
            if (status !== undefined) {
                status = undefined
                continue
            }
            await getMatchDataAndSaveCombination(matchIdList)
        }
        logger.info('매치데이터 조회 및 챔피언 조합 승률 분석 완료')
        key = 0
        return
    } catch (err) {
        logger.error(err, { message: '-from saveCombination' })
        return
    }
}

async function getMatchDataAndSaveCombination(matchIdList) {
    try {
        const matchId = matchIdList[key].matchId
        const tier = matchIdList[key].tier
        const division = matchIdList[key].division
        // console.log(`${key}번째 데이터 분석 시작`, matchId, tier, division)
        const matchDataApiUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${process.env.KEY}`
        const response = await axios.get(matchDataApiUrl)
        const matchData = response.data
        if (matchData.info.gameMode !== "CLASSIC") {
            // TODO: 수정해야함
            await updateWrongMatchDataAnalyzed(matchId)
            // console.log("게임 모드가 CLASSIC이 아닙니다")
            return key++
        }
        if (matchData.info.queueId !== 420) {
            await updateWrongMatchDataAnalyzed(matchId)
            // console.log("게임 모드가 솔로랭크가 아닙니다")
            return key++
        }
        let version = matchData.info.gameVersion.substr(0, 5)
        let winjungle, winmiddle, wintop, winbottom, winutility
        let losejungle, losemiddle, losetop, losebottom, loseutility
        for (let i = 0; i < matchData.info.participants.length; i++) {
            const win = matchData.info.participants[i].win
            let position = matchData.info.participants[i].teamPosition
            if (position === undefined) {
                continue
            }
            if (win) {
                switch (position) {
                    case "MIDDLE":
                        winmiddle = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                        }
                        break
                    case "TOP":
                        wintop = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                        }
                        break
                    case "BOTTOM":
                        winbottom = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                        }
                        break
                    case "UTILITY":
                        winutility = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                        }
                        break
                    case "JUNGLE":
                        winjungle = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                        }
                        break
                }
            } else {
                switch (position) {
                    case "MIDDLE":
                        losemiddle = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                        }
                        break
                    case "TOP":
                        losetop = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                        }
                        break
                    case "BOTTOM":
                        losebottom = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                        }
                        break
                    case "UTILITY":
                        loseutility = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                        }
                        break
                    case "JUNGLE":
                        losejungle = {
                            position,
                            champId: matchData.info.participants[i].championId,
                            champName: matchData.info.participants[i].championName,
                        }
                        break
                }
            }
        }
        if (
            !wintop ||
            !winjungle ||
            !winmiddle ||
            !winbottom ||
            !winutility ||
            !losetop ||
            !losejungle ||
            !losebottom ||
            !losemiddle ||
            !loseutility
        ) {
            // console.log("@@@@@@@@@@@@@@@@@여기서 멈췄어")
            await updateWrongMatchDataAnalyzed(matchId)
            return key++
        }
        // 탑 정글 넣기
        // TODO: matchData 기준인거 matchId 버전으로 수정
        const existWinTopJungle = await checkCombinationData(wintop, winjungle, 0, version)
        const existWinMidJungle = await checkCombinationData(winmiddle, winjungle, 1, version)
        const existWinBottomDuo = await checkCombinationData(winbottom, winutility, 2, version)

        const existLoseTopJungle = await checkCombinationData(losetop, losejungle, 0, version)
        const existLoseMidJungle = await checkCombinationData(losemiddle, losejungle, 1, version)
        const existLoseBottomDuo = await checkCombinationData(losebottom, loseutility, 2, version)
        if (existWinTopJungle.length === 0) {
            await saveCombinationData(matchId, wintop, winjungle, "win", 0, version)
        } else {
            await updateCombinationData(matchId, wintop, winjungle, "win", 0, version)
        }
        if (existWinMidJungle.length === 0) {
            await saveCombinationData(matchId, winmiddle, winjungle, "win", 1, version)
        } else {
            await updateCombinationData(matchId, winmiddle, winjungle, "win", 1, version)
        }
        if (existWinBottomDuo.length === 0) {
            await saveCombinationData(matchId, winbottom, winutility, "win", 2, version)
        } else {
            await updateCombinationData(matchId, winbottom, winutility, "win", 2, version)
        }

        if (existLoseTopJungle.length === 0) {
            await saveCombinationData(matchId, losetop, losejungle, "lose", 0, version)
        } else {
            await updateCombinationData(matchId, losetop, losejungle, "lose", 0, version)
        }
        if (existLoseMidJungle.length === 0) {
            await saveCombinationData(matchId, losemiddle, losejungle, "lose", 1, version)
        } else {
            await updateCombinationData(matchId, losemiddle, losejungle, "lose", 1, version)
        }
        if (existLoseBottomDuo.length === 0) {
            await saveCombinationData(matchId, losebottom, loseutility, "lose", 2, version)
        } else {
            await updateCombinationData(matchId, losebottom, loseutility, "lose", 2, version)
        }
        // console.log(`${key}번째 데이터 ( ${matchId}: 패치버전 ${version} 분석 완료`)
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
    return key++
}

exports.transferVersiontoMatchId = async () => {
    const data = await findVersionAndMatchId()
    for (let i = 0; i <= data.length; i++) {
        const matchId = data[i].matchId
        const version = data[i].version
        // console.log(matchId, version)
        await transferVersiontoMatchId(matchId, version)
        // console.log(`${i} 번째 테스크: ${matchId} version ${version} 업데이트 완료`)
    }
    // console.log('end')
    return
}