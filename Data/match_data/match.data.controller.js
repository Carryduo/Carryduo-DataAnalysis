require("dotenv").config()
const axios = require("axios")
const { sleep } = require("../../timer")
const { getMatchId, saveMatchData, saveChampInfo, addWinCnt, addGameCnt, getChampInfo, getMatchDataCnt, getMatchData, addbanCnt, getChampBanCnt, saveCombinationData, checkCombinationData, updateCombinationData, getData } = require("./match.data.service")

exports.userRecord = async (req, res, next) => {
    let matchArr = ["KR_6110923066", "KR_6110902608", "KR_6110889472", "KR_6110878033", "KR_6110797680", "KR_6110873891", "KR_6110802405", "KR_6110776161", "KR_6110772273", "KR_6110374163", "KR_6110137952", "KR_6109399977", "KR_6108595057", "KR_6108570762", "KR_6108494112", "KR_6087703551", "KR_6087648041", "KR_6086632875", "KR_6086570513", "KR_6086507114"]
    const summonerName = "할배탈"
    const result = []
    const userRecord = []
    for (let i of matchArr) {
        const matchDataApiUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/${i}?api_key=${process.env.KEY}`
        const response = await axios.get(matchDataApiUrl)
        result.push(response.data.info)
    }
    for (let r of result) {
        if (r.gameMode === "CLASSIC") {
            for (let p of r.participants) {
                if (p.summonerName === summonerName) {
                    userRecord.push({ kills: p.kills, deaths: p.deaths, assists: p.assists, championName: p.championName, lane: p.lane, win: p.win })
                }
            }
        }
    }
    let win = 0
    let lose = 0
    let kill = []
    let death = []
    let assi = []
    const champNameArr = []
    const champNameResult = {}
    let sortable = []
    for (let u of userRecord) {
        if (u.win === true) {
            win++
        } else {
            lose++
        }
        kill.push(u.kills)
        death.push(u.deaths)
        assi.push(u.assists)
        champNameArr.push(u.championName)
    }
    for (let k of kill) {
    }
    console.log({ win, lose, kill, death, assi })

    champNameArr.map((x) => {
        champNameResult[x] = (champNameResult[x] || 0) + 1
    })

    for (let cnr in champNameResult) {
        sortable.push([cnr, champNameResult[cnr]])
    }

    sortable.sort(function (a, b) {
        return b[1] - a[1]
    })
    let sortableSlice = sortable.slice(0, 3)
    let sortResult = []
    sortableSlice.map((v) => {
        sortResult.push(...v)
    })

    let topChampList = []
    for (let i = 0; i < sortResult.length; i++) {
        if (i % 2 === 0) {
            topChampList.push(sortResult[i])
        }
    }
    const champWinRate = [] //[ 'Samira', 5, 'Amumu', 2, 'Blitzcrank', 2 ]

    for (let u2 of userRecord) {
        for (let tcl of topChampList) {
            if (u2.championName === tcl) {
                console.log({ champ: u2.championName, win: u2.win, kill: u2.kills, death: u2.deaths, assi: u2.assists, aver: (u2.kills + u2.assists) / u2.deaths })
            }
        }
    }
    res.status(200).send({ result: "success" })
}

let key = 0
let status
exports.saveMatchData = async (req, res, next) => {
    const matchIdList = await getMatchIdList()
    console.log(matchIdList.length)
    while (key !== matchIdList.length + 1) {
        if (status !== undefined) {
            status = undefined
            continue
        }
        await saveMatchDataFunction(matchIdList)
    }
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
    res.status(200).json({ data })
}

exports.analyzeCombination = async (req, res, next) => {
    const data = await getMatchData()
    const result = []
    for (let z = 0; z < data.length; z++) {
        console.log(z, data[z].data.info.gameMode)
        if (data[z].data.info.gameMode !== "CLASSIC") continue
        if (data[z].data.info.queueId !== 420) continue
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
                    case "MIDDLE":
                        winmiddle = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                    case "TOP":
                        wintop = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                    case "BOTTOM":
                        winbottom = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                    case "UTILITY":
                        winutility = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                    case "JUNGLE":
                        winjungle = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                }
            } else {
                switch (position) {
                    case "MIDDLE":
                        losemiddle = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                    case "TOP":
                        losetop = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                    case "BOTTOM":
                        losebottom = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                    case "UTILITY":
                        loseutility = {
                            position,
                            champId: data[z].data.info.participants[i].championId,
                            champName: data[z].data.info.participants[i].championName,
                        }
                        break
                    case "JUNGLE":
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
            await saveCombinationData(wintop, winjungle, "win", 0)
        } else {
            await updateCombinationData(wintop, winjungle, "win")
        }
        if (existWinMidJungle.length === 0) {
            await saveCombinationData(winmiddle, winjungle, "win", 1)
        } else {
            await updateCombinationData(winmiddle, winjungle, "win")
        }
        if (existWinBottomDuo.length === 0) {
            await saveCombinationData(winbottom, winutility, "win", 2)
        } else {
            await updateCombinationData(winbottom, winutility, "win")
        }

        if (existLoseTopJungle.length === 0) {
            await saveCombinationData(losetop, losejungle, "lose", 0)
        } else {
            await updateCombinationData(losetop, losejungle, "lose")
        }
        if (existLoseMidJungle.length === 0) {
            await saveCombinationData(losemiddle, losejungle, "lose", 1)
        } else {
            await updateCombinationData(losemiddle, losejungle, "lose")
        }
        if (existLoseBottomDuo.length === 0) {
            await saveCombinationData(losebottom, loseutility, "lose", 2)
        } else {
            await updateCombinationData(losebottom, loseutility, "lose")
        }
    }

    res.status(200).json({ result })
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
