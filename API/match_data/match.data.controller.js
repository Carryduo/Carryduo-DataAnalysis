require("dotenv").config()
const axios = require("axios")
const { sleep } = require("../../timer")
const { getMatchId, saveMatchData } = require("./match.data.service")

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

