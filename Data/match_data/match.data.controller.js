require("dotenv").config()
const axios = require("axios")
const { sleep } = require("../../timer")
const { getMatchId, saveMatchData, getMatchData, saveChampInfo, addWinCnt, addGameCnt, getChampInfo, getMatchDataCnt, addbanCnt, getChampBanCnt } = require("./match.data.service")

let key = 0
let status

exports.saveMatchData = async (req, res, next) => {
    const matchIdList = await getMatchIdList()
    while (key !== matchIdList.length + 1) {
        if (status !== 404) {
            await saveMatchDataFunction()
        } else {
            break
        }
    }
    res.status(200).send({ result: "success" })
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
    ban()

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
    const result = data.map((value) => {
        return (value = value.matchId)
    })
    return result
}
