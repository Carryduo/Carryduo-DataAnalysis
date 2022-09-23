require("dotenv").config()
const axios = require("axios")
const { sleep } = require("../../timer")
const { getMatchId, saveMatchData, getMatchData, saveCombinationData, checkCombinationData, updateCombinationData, getData } = require("./match.data.service")

let key = 0
let status
exports.saveMatchData = async (req, res, next) => {

    const matchIdList = await getMatchIdList()
    console.log(matchIdList)
    while (key !== matchIdList.length + 1) {
        if (status !== 404) {
            await saveMatchDataFunction()
        } else {
            break
        }
    }
    res.status(200).send({ result: 'success' })
}

exports.analyzeCombination = async (req, res, next) => {
    const data = await getMatchData()
    const result = []
    for (let z = 0; z < data.length; z++) {
        console.log(z, data[z].data.info.gameMode)
        if (data[z].data.info.gameMode !== 'CLASSIC') continue
        const game = []
        let winTeam = []
        let loseTeam = []
        let winjungle, winmiddle, wintop, winbottom, winutility
        let losejungle, losemiddle, losetop, losebottom, loseutility
        for (let i = 0; i < data[z].data.info.participants.length; i++) {
            const win = data[z].data.info.participants[i].win
            let position = data[z].data.info.participants[i].teamPosition
            if (position === undefined) {
                continue
            }
            if (win) {
                switch (position) {
                    case 'MIDDLE':
                        winmiddle = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                    case 'TOP':
                        wintop = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                    case 'BOTTOM':
                        winbottom = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                    case 'UTILITY':
                        winutility = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                    case 'JUNGLE':
                        winjungle = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                }
            } else {
                switch (position) {
                    case 'MIDDLE':
                        losemiddle = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                    case 'TOP':
                        losetop = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                    case 'BOTTOM':
                        losebottom = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                    case 'UTILITY':
                        loseutility = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                    case 'JUNGLE':
                        losejungle = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                }
            }
        }
        if (!wintop || !winjungle || !winmiddle || !winbottom || !winutility || !losetop || !losejungle || !losebottom || !losemiddle || !loseutility) {
            console.log('@@@@@@@@@@@@@@@@@여기서 멈췄어')
            continue
        }
        console.log('이긴팀', {
            wintop, winjungle, winmiddle, winbottom, winutility
        })
        console.log('진팀', {
            losetop, losejungle, losemiddle, losebottom, loseutility
        })
        // 탑 정글 넣기
        const existWinTopJungle = await checkCombinationData(wintop, winjungle)
        const existWinMidJungle = await checkCombinationData(winmiddle, winjungle)
        const existWinBottomDuo = await checkCombinationData(winbottom, winutility)

        const existLoseTopJungle = await checkCombinationData(losetop, losejungle)
        const existLoseMidJungle = await checkCombinationData(losemiddle, losejungle)
        const existLoseBottomDuo = await checkCombinationData(losebottom, loseutility)
        if (existWinTopJungle.length === 0) {

            await saveCombinationData(wintop, winjungle, 'win', 0)
        } else {
            await updateCombinationData(wintop, winjungle, 'win')
        }
        if (existWinMidJungle.length === 0) {
            await saveCombinationData(winmiddle, winjungle, 'win', 1)
        } else {
            await updateCombinationData(winmiddle, winjungle, 'win')
        }
        if (existWinBottomDuo.length === 0) {
            await saveCombinationData(winbottom, winutility, 'win', 2)
        } else {
            await updateCombinationData(winbottom, winutility, 'win')
        }

        if (existLoseTopJungle.length === 0) {
            await saveCombinationData(losetop, losejungle, 'lose', 0)
        } else {
            await updateCombinationData(losetop, losejungle, 'lose')
        }
        if (existLoseMidJungle.length === 0) {
            await saveCombinationData(losemiddle, losejungle, 'lose', 1)
        } else {
            await updateCombinationData(losemiddle, losejungle, 'lose')
        }
        if (existLoseBottomDuo.length === 0) {
            await saveCombinationData(losebottom, loseutility, 'lose', 2)
        } else {
            await updateCombinationData(losebottom, loseutility, 'lose')
        }
        //     TODO: 랭크게임만 추출하기: gameMode = CLASSIC
        //     승리팀, 패배팀 나누기
        // 게임마다 탑 - 정글 / 미드 - 정글 / 원딜 - 서폿으로 묶기

        // db에 있는 데이터인지 체크하기
        // 있는 데이터면 승리 / 실패 / 표본수 카운트 update 하기
        // 없는 데이터면 새로 생성하기
    }


    res.status(200).json({ result })
}

exports.getAnalysis = async (req, res, next) => {
    const { type } = req.params
    console.log(type)
    const data = await getData(type)
    res.status(200).json({ data })
}


async function saveMatchDataFunction() {
    const matchIdList = await getMatchIdList()
    try {
        const matchId = matchIdList[key]
        console.log(`${key}번째 데이터 분석 시작`, matchId)
        const matchDataApiUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${process.env.KEY}`
        const response = await axios.get(matchDataApiUrl)
        await saveMatchData(response.data)
    } catch (err) {
        if (!err.response) {
            console.log("err.response가 없다! " + err)
            console.log(key + " 번째 부터 오류!")
            return
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
            return
        }
    }
    console.log(`${key}번째 데이터 분석 끝`)
    return key++
}


async function getMatchIdList() {
    const data = await getMatchId()
    // MatchId list
    const result = data.map((value) => {
        return value = value.matchId
    })
    return result
}


