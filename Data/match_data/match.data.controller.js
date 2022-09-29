require("dotenv").config()
const axios = require("axios")
const { sleep } = require("../../timer")
const { getMatchId, saveMatchData, saveChampInfo, addWinCnt, addGameCnt, getChampInfo, getMatchDataCnt, getMatchData, addbanCnt, getChampBanCnt, saveCombinationData, checkCombinationData, updateCombinationData, getData, disconnect } = require("./match.data.service")

let key = 0
let status

exports.saveMatchData = async (req, res, next) => {
    const matchIdList = await getMatchIdList()
    console.log(matchIdList.length)
    while (key !== matchIdList.length) {
        if (status !== undefined) {
            status = undefined
            continue
        }
        await saveMatchDataFunction(matchIdList)
    }
    await disconnect()
    res.status(200).send({ result: 'success' })
}
exports.Rate = async (req, res, next) => {
    const { champId } = req.params

    const result = await getMatchDataCnt()
    const champ = await getChampInfo(champId)

    let winRate = (champ.win / champ.game) * 100
    winRate = winRate.toFixed(2)
    let pickRate = (champ.game / result) * 100
    pickRate = pickRate.toFixed(2)
    let banRate = (champ.ban / result) * 100
    banRate = banRate.toFixed(2)

    return res.status(200).json({ winRate, pickRate, banRate })
}

//이긴 게임 / 1920 = 승률, 해당챔피언 존재하는 게임/ 1920 = 픽률, 해당 챔피언 밴한 게임/1920

exports.champAnalysis = async (req, res, next) => {
    try {
        let cnt = 0
        const result = await getMatchData()

        for (let i of result) {
            console.log("Count: " + cnt)
            if (i.data.info.gameMode === "CLASSIC" && i.data.info.queueId === 420) {
                const participants = i.data.info.participants

                for (let v of participants) {
                    const champ = await getChampInfo(v.championId)

                    if (!champ) {
                        if (v.win) {
                            await saveChampInfo(v.championId, v.championName, 1, 1) //챔프가 없는데 이겼으면 win:1
                        } else {
                            await saveChampInfo(v.championId, v.championName, 0, 1) //챔프가 없는데 졌으면 win:0
                        }
                    } else {
                        if (v.win) {
                            await addWinCnt(v.championId, champ.win) //챔프가 있는데 이기면 win +1
                            await addGameCnt(v.championId, champ.game)
                        } else {
                            await addGameCnt(v.championId, champ.game) //챔프가 있는데 졌으면 game만 +1
                        }
                    }
                }
            }
            cnt++
        }
        await ban(result)
        console.log("완료!")

        return res.status(200).json({ result: true })
    } catch (err) {
        console.log(err)
        return res.status(400).json({ err })
    }
}

exports.getAnalysis = async (req, res, next) => {
    const { type } = req.params
    console.log(type)
    const data = await getData(type)
    console.log(data)
    res.status(200).json({ data })
}

exports.analyzeCombination = async (req, res, next) => {
    const data = await getMatchData()
    const result = []
    console.log(data.length)
    for (let z = 0; z < data.length; z++) {
        const matchId = data[z].matchId
        const id = data[z].id
        if (data[z].matchData.info.gameMode !== "CLASSIC") continue
        if (data[z].matchData.info.queueId !== 420) continue
        let winjungle, winmiddle, wintop, winbottom, winutility
        let losejungle, losemiddle, losetop, losebottom, loseutility
        for (let i = 0; i < data[z].matchData.info.participants.length; i++) {
            const win = data[z].matchData.info.participants[i].win
            let position = data[z].matchData.info.participants[i].teamPosition
            if (position === undefined) {
                continue
            }
            if (win) {
                switch (position) {
                    case "MIDDLE":
                        winmiddle = {
                            position,
                            champId: data[z].matchData.info.participants[i].championId,
                            champName: data[z].matchData.info.participants[i].championName,
                        }
                        break
                    case "TOP":
                        wintop = {
                            position,
                            champId: data[z].matchData.info.participants[i].championId,
                            champName: data[z].matchData.info.participants[i].championName,
                        }
                        break
                    case "BOTTOM":
                        winbottom = {
                            position,
                            champId: data[z].matchData.info.participants[i].championId,
                            champName: data[z].matchData.info.participants[i].championName,
                        }
                        break
                    case "UTILITY":
                        winutility = {
                            position,
                            champId: data[z].matchData.info.participants[i].championId,
                            champName: data[z].matchData.info.participants[i].championName,
                        }
                        break
                    case "JUNGLE":
                        winjungle = {
                            position,
                            champId: data[z].matchData.info.participants[i].championId,
                            champName: data[z].matchData.info.participants[i].championName,
                        }
                        break
                }
            } else {
                switch (position) {
                    case "MIDDLE":
                        losemiddle = {
                            position,
                            champId: data[z].matchData.info.participants[i].championId,
                            champName: data[z].matchData.info.participants[i].championName,
                        }
                        break
                    case "TOP":
                        losetop = {
                            position,
                            champId: data[z].matchData.info.participants[i].championId,
                            champName: data[z].matchData.info.participants[i].championName,
                        }
                        break
                    case "BOTTOM":
                        losebottom = {
                            position,
                            champId: data[z].matchData.info.participants[i].championId,
                            champName: data[z].matchData.info.participants[i].championName,
                        }
                        break
                    case "UTILITY":
                        loseutility = {
                            position,
                            champId: data[z].matchData.info.participants[i].championId,
                            champName: data[z].matchData.info.participants[i].championName,
                        }
                        break
                    case "JUNGLE":
                        losejungle = {
                            position,
                            champId: data[z].matchData.info.participants[i].championId,
                            champName: data[z].matchData.info.participants[i].championName,
                        }
                        break
                }
            }
        }
        if (!wintop || !winjungle || !winmiddle || !winbottom || !winutility || !losetop || !losejungle || !losebottom || !losemiddle || !loseutility) {
            console.log("@@@@@@@@@@@@@@@@@여기서 멈췄어")
            continue
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
        const existWinTopJungle = await checkCombinationData(wintop, winjungle)
        const existWinMidJungle = await checkCombinationData(winmiddle, winjungle)
        const existWinBottomDuo = await checkCombinationData(winbottom, winutility)

        const existLoseTopJungle = await checkCombinationData(losetop, losejungle)
        const existLoseMidJungle = await checkCombinationData(losemiddle, losejungle)
        const existLoseBottomDuo = await checkCombinationData(losebottom, loseutility)
        if (existWinTopJungle.length === 0) {
            await saveCombinationData(id, matchId, wintop, winjungle, "win", 0)
        } else {
            await updateCombinationData(id, matchId, wintop, winjungle, "win")
        }
        if (existWinMidJungle.length === 0) {
            await saveCombinationData(id, matchId, winmiddle, winjungle, "win", 1)
        } else {
            await updateCombinationData(id, matchId, winmiddle, winjungle, "win")
        }
        if (existWinBottomDuo.length === 0) {
            await saveCombinationData(id, matchId, winbottom, winutility, "win", 2)
        } else {
            await updateCombinationData(id, matchId, winbottom, winutility, "win")
        }

        if (existLoseTopJungle.length === 0) {
            await saveCombinationData(id, matchId, losetop, losejungle, "lose", 0)
        } else {
            await updateCombinationData(id, matchId, losetop, losejungle, "lose")
        }
        if (existLoseMidJungle.length === 0) {
            await saveCombinationData(id, matchId, losemiddle, losejungle, "lose", 1)
        } else {
            await updateCombinationData(id, matchId, losemiddle, losejungle, "lose")
        }
        if (existLoseBottomDuo.length === 0) {
            await saveCombinationData(id, matchId, losebottom, loseutility, "lose", 2)
        } else {
            await updateCombinationData(id, matchId, losebottom, loseutility, "lose")
        }
    }

    res.status(200).json({ result: 'success' })
}

//벤 저장 할 때 한게임에서 중복되는 벤 제거 할지...
async function ban(result) {
    let banId = []
    for (let i of result) {
        if (i.data.info.gameMode === "CLASSIC" && i.data.info.queueId === 420) {
            const teams = i.data.info.teams

            for (let t of teams) {
                const ban = t.bans
                for (let b of ban) {
                    if (b.championId === -1) {
                        continue
                    }
                    const champBanCnt = await getChampBanCnt(b.championId)

                    if (!banId.includes(b.championId)) {
                        banId.push(b.championId)
                        await addbanCnt(b.championId, champBanCnt.ban)
                    }
                }
            }
            banId = []
            console.log("1번 완료: " + banId)
        }
    }
}

async function saveMatchDataFunction(matchIdList) {
    try {
        const matchId = matchIdList[key].matchId
        const tier = matchIdList[key].tier
        const division = matchIdList[key].division
        console.log(`${key}번째 데이터 분석 시작`, matchId)
        const matchDataApiUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${process.env.KEY}`
        const response = await axios.get(matchDataApiUrl)
        const result = await saveMatchData(response.data, tier, division, matchId)
        console.log(result)
    } catch (err) {
        if (!err.response) {
            console.log("라이엇으로부터 err.response가 없다! ")
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
            return key++
        }
    }
    console.log(`${key}번째 데이터 분석 끝`)
    return key++
}

async function getMatchIdList() {
    const data = await getMatchId()
    // const result = data.map((value) => {
    //     return (value = value.matchId)
    // })
    return data
}
