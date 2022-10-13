require("dotenv").config()
const axios = require("axios")
const { matchIdLogging, taskSuccessLogging, taskErrLogging } = require("../../logging/log")
const { sleep } = require("../../timer/timer")
const {
    getMatchId,
    saveCombinationData,
    checkCombinationData,
    updateCombinationData,
    getData,
    updateWinRate,
    findRawCombinationData,
    findCombinationCleansedData,
    updateCombinationTier,
    getCombinationData,
    transferToService,
    updateWrongMatchDataAnalyzed,
} = require("./match.data.service")

let key = 0
let status

// 챔피언 조합승률 관련
exports.getAnalysis = async (req, res, next) => {
    const { type } = req.params
    console.log(type)
    const data = await getData(type)
    console.log(data)
    res.status(200).json({ data })
}

exports.uploadCombinationWinRate = async (req, res, next) => {
    try {
        console.log('챔피언 조합 승률 로우데이터 승률로 변환')
        await matchIdLogging(0, '챔피언 조합 승률 로우데이터 승률로 변환')
        let data = await findRawCombinationData()
        console.log(data.length)
        data = data.map((value) => {
            value = {
                winrate: value.win / value.sampleNum,
                mainChampId: value.mainChampId,
                subChampId: value.subChampId,
                category: value.category,
                sample_num: value.sampleNum,
            }
            return value
        })
        for (let i = 0; i < data.length; i++) {
            const result = await updateWinRate(data[i])
            console.log(`${i}번째`, result)
        }

        return "success"
    }
    catch (err) {
        console.log(err)
        await taskErrLogging(err, '챔피언 조합 승률 로우데이터 승률로 변환')
    }
}

exports.updateCombinationTierAndRank = async (req, res, next) => {
    try {
        console.log('챔피언 조합 승률 데이터 티어, 랭크 삽입')
        await matchIdLogging(0, '챔피언 조합 승률 데이터 티어, 랭크 삽입')
        let { category0, category1, category2 } = await findCombinationCleansedData()
        // 표본 5 미만인 것은 rank 0으로 맞추기
        const categories = [category0, category1, category2]
        let rankList = []
        for (let category of categories) {
            for (let i = 0; i < category.length; i++) {
                if (category[i].sample_num < 10) {
                    category[i].rank_in_category = 0
                } else {
                    // 표본 5 이상인 것은 새로운 배열로 만들어서, 승률로 sort하기
                    rankList.push(category[i])
                }
            }
            rankList.sort((a, b) => {
                return b.winrate - a.winrate
            })
            for (let j = 0; j < rankList.length; j++) {
                rankList[j].rank_in_category = j + 1
            }
            rankList.map((value) => {
                if (value.rank_in_category < 4) {
                    value.tier = 1
                } else if (4 <= value.rank_in_category && value.rank_in_category < 11) {
                    value.tier = 2
                } else if (11 <= value.rank_in_category && value.rank_in_category < 21) {
                    value.tier = 3
                } else if (21 <= value.rank_in_category && value.rank_in_category < 28) {
                    value.tier = 4
                } else if (28 <= value.rank_in_category) {
                    value.tier = 5
                }
                return value
            })

            for (let k = 0; k < rankList.length; k++) {
                await updateCombinationTier(rankList[k])
            }
            // rankList 카테고리 초기화
            rankList = []
        }
        await taskSuccessLogging('챔피언 조합 승률 데이터 티어, 랭크 삽입')
        return "success"
    } catch (err) {
        console.log(err)
        await taskErrLogging(err, '챔피언 조합 승률 데이터 티어, 랭크 삽입')
    }
}

exports.transferCombinationStatToServiceDB = async (req, res, next) => {
    try {
        console.log('챔피언 조합 승률 데이터 서비스 DB로 이관')
        await matchIdLogging(0, '챔피언 조합 승률 데이터 서비스 DB로 이관')
        const dataList = await getCombinationData()
        let result
        for (let data of dataList) {
            result = await transferToService(data)
            console.log(result)
        }
        await taskSuccessLogging('챔피언 조합 승률 데이터 서비스 DB로 이관')
    }
    catch (err) {
        console.log(err)
        await taskErrLogging(err, '챔피언 조합 승률 데이터 서비스 DB로 이관')
    }
}

// TODO: 테스트 --------------------------------------------------------------
exports.saveCombination = async (req, res, next) => {
    try {
        const matchIdList = await getMatchId()
        console.log(matchIdList.length, '매치데이터 조회 및 챔피언 조합 승률 분석 시작')
        await matchIdLogging('key 숫자', key, matchIdList.length, '매치데이터 조회 및 챔피언 조합 승률 분석 시작')
        while (key !== matchIdList.length) {
            if (status !== undefined) {
                status = undefined
                continue
            }
            await getMatchDataAndSaveCombination(matchIdList)
        }
        await taskSuccessLogging('매치데이터 조회 및 챔피언 조합 승률 분석 시작')
        key = 0
        return
    } catch (error) {
        console.log(error)
        await taskErrLogging(error, '매치데이터 조회 및 챔피언 조합 승률 분석 시작')
        return
    }
}

async function getMatchDataAndSaveCombination(matchIdList) {
    try {
        console.log(`${key} 번째`)
        const matchId = matchIdList[key].matchId
        const tier = matchIdList[key].tier
        const division = matchIdList[key].division
        console.log(`${key}번째 데이터 분석 시작`, matchId, tier, division)
        const matchDataApiUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${process.env.KEY}`
        const response = await axios.get(matchDataApiUrl)
        const matchData = response.data
        if (matchData.info.gameMode !== "CLASSIC") {
            // TODO: 수정해야함
            await updateWrongMatchDataAnalyzed(matchId)
            console.log("게임 모드가 CLASSIC이 아닙니다")
            return key++
        }
        if (matchData.info.queueId !== 420) {
            await updateWrongMatchDataAnalyzed(matchId)
            console.log("게임 모드가 솔로랭크가 아닙니다")
            return key++
        }
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
            console.log("@@@@@@@@@@@@@@@@@여기서 멈췄어")
            await updateWrongMatchDataAnalyzed(matchId)
            return key++
        }
        console.log("이긴팀", {
            wintop,
            winjungle,
            winmiddle,
            winbottom,
            winutility,
        })
        console.log("진팀", {
            losetop,
            losejungle,
            losemiddle,
            losebottom,
            loseutility,
        })
        // 탑 정글 넣기
        // TODO: matchData 기준인거 matchId 버전으로 수정
        const existWinTopJungle = await checkCombinationData(wintop, winjungle)
        const existWinMidJungle = await checkCombinationData(winmiddle, winjungle)
        const existWinBottomDuo = await checkCombinationData(winbottom, winutility)

        const existLoseTopJungle = await checkCombinationData(losetop, losejungle)
        const existLoseMidJungle = await checkCombinationData(losemiddle, losejungle)
        const existLoseBottomDuo = await checkCombinationData(losebottom, loseutility)
        console.log(matchId)
        if (existWinTopJungle.length === 0) {
            await saveCombinationData(matchId, wintop, winjungle, "win", 0)
        } else {
            await updateCombinationData(matchId, wintop, winjungle, "win")
        }
        if (existWinMidJungle.length === 0) {
            await saveCombinationData(matchId, winmiddle, winjungle, "win", 1)
        } else {
            await updateCombinationData(matchId, winmiddle, winjungle, "win")
        }
        if (existWinBottomDuo.length === 0) {
            await saveCombinationData(matchId, winbottom, winutility, "win", 2)
        } else {
            await updateCombinationData(matchId, winbottom, winutility, "win")
        }

        if (existLoseTopJungle.length === 0) {
            await saveCombinationData(matchId, losetop, losejungle, "lose", 0)
        } else {
            await updateCombinationData(matchId, losetop, losejungle, "lose")
        }
        if (existLoseMidJungle.length === 0) {
            await saveCombinationData(matchId, losemiddle, losejungle, "lose", 1)
        } else {
            await updateCombinationData(matchId, losemiddle, losejungle, "lose")
        }
        if (existLoseBottomDuo.length === 0) {
            await saveCombinationData(matchId, losebottom, loseutility, "lose", 2)
        } else {
            await updateCombinationData(matchId, losebottom, loseutility, "lose")
        }
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
