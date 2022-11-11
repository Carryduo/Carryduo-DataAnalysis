require("dotenv").config()
const axios = require("axios")
const { version } = require("mongoose")
const logger = require("../../log")
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
    findVersion,
    findVersionAndMatchId,
    transferVersiontoMatchId,
    checkRank,
    updateNotRankedData
} = require("./combination.service")

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
        logger.info('챔피언 조합 승률 로우 데이터 승률로 변환 시작')
        let data = await findRawCombinationData()
        console.log(data.length)
        data = data.map((value) => {
            value = {
                winrate: value.win / value.sampleNum,
                mainChampId: value.mainChampId,
                subChampId: value.subChampId,
                category: value.category,
                sample_num: value.sampleNum,
                version: value.version
            }
            return value
        })
        for (let i = 0; i < data.length; i++) {
            const result = await updateWinRate(data[i])
            console.log(`${i}번째 챔피언 조합승률 로우 데이터 승률 변환 완료`)
        }
        logger.info('챔피언 조합 승률 로우 데이터 승률로 변환 완료')
        return
    }
    catch (err) {
        logger.error(err, { message: '-from 챔피언 조합 승률 로우데이터 승률로 변환' })
    }
}

exports.updateCombinationTierAndRank = async (req, res, next) => {
    try {
        const versionList = await findVersion()
        logger.info('챔피언 조합 승률 데이터 티어, 랭크 삽입')
        for (let versionKey of versionList) {
            const version = versionKey.version

            // TODO: 버전에 따라서도 각각 나눠서 계산할 수 있게 해야함.
            let { category0, category1, category2 } = await findCombinationCleansedData(version)
            // 표본 5 미만인 것은 rank 0으로 맞추기
            const categories = [category0, category1, category2]
            let rankList = []
            for (let category of categories) {
                for (let i = 0; i < category.length; i++) {
                    if (category[i].sample_num < 10) {
                        console.log(`패치버전 : ${version}`, `라인: ${category[i].category}`, '표본 10 미만, 오류 검토')

                        if (category[i].tier !== 0 && category[i].rank_in_category !== 0) {
                            await updateNotRankedData(category[i].mainChampId, category[i].subChampId, category[i].category, category[i].version)
                            console.log(category[i].mainChampId, category[i].subChampId, category[i].category, category[i].version, '티어 삽입 오류 수정 완료')
                        }
                    } else {
                        console.log(`패치버전 : ${version}`, `라인: ${category[i].category}`, '표본 10 이상, rankList에 삽입')
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

                // 표본이 10 이상인 것들만 삽입된 rankList를 combination에 삽입
                for (let k = 0; k < rankList.length; k++) {
                    await updateCombinationTier(rankList[k])
                    console.log(`패치버전: ${version}`, `라인: ${rankList[k].category}`, k, '번째 티어/랭크 삽입 완료')
                }
                // rankList 카테고리 초기화
                rankList = []
            }
        }
        logger.info('챔피언 조합 승률 데이터 티어, 랭크 삽입')
        return
    } catch (err) {
        console.log(err)
        logger.error(err, { message: '-from 챔피언 조합 승률 데이터 티어, 랭크 삽입' })
    }
}

exports.transferCombinationStatToServiceDB = async (req, res, next) => {
    try {
        logger.info('챔피언 조합 승률 데이터 서비스 DB로 이관')
        const dataList = await getCombinationData()
        let result
        for (let i = 0; i < dataList.length; i++) {
            await transferToService(dataList[i])
            console.log(`${i}번째 챔피언 조합 승률 데이터 서비스 DB로 이관 완료`)
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
    } catch (error) {
        logger.error(err, { message: '-from saveCombination' })
        return
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
            await updateWrongMatchDataAnalyzed(matchId)
            console.log("게임 모드가 CLASSIC이 아닙니다")
            return key++
        }
        if (matchData.info.queueId !== 420) {
            await updateWrongMatchDataAnalyzed(matchId)
            console.log("게임 모드가 솔로랭크가 아닙니다")
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
            console.log("@@@@@@@@@@@@@@@@@여기서 멈췄어")
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
        console.log(`${key}번째 데이터 ( ${matchId}: 패치버전 ${version} 분석 완료`)
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
        console.log(matchId, version)
        await transferVersiontoMatchId(matchId, version)
        console.log(`${i} 번째 테스크: ${matchId} version ${version} 업데이트 완료`)
    }
    console.log('end')
    return
}