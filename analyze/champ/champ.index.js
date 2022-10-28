const { sleep } = require("../../timer/timer")
const logger = require("../../log")
const axios = require("axios")

const { matchIdList } = require("./champInfo.service")

const { winRate } = require("./champ.rate/rate.controller")
const { position } = require("./champ.position/position.controller")
const { spell } = require("./champ.spell/spell.controller")

let key = 0
let status
exports.startChampInfo = async () => {
    try {
        let count = 0
        const data = await matchIdList()
        logger.info(data.length, { message: "- 승/밴/픽, 스펠, 포지션 데이터분석 matchId 개수" })
        while (key !== data.length) {
            if (status !== undefined) {
                status = undefined
                continue
            }
            const matchData = await requestRiotAPI(data[key].matchid_matchId)
            if (matchData === "next") {
                key++
                continue
            }
            await winRate(matchData, key)

            count++
            console.log(count + "경기수")
            key++
        }
        key = 0
        logger.info("승/밴/픽, 스펠, 포지션 데이터분석완료")
        return
    } catch (err) {
        logger.error(err, { message: "- from startChampInfo" })
        return err
    }
}

//라이엇 매치데이터 요청
async function requestRiotAPI(matchId) {
    try {
        const matchDataApiUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${process.env.KEY}`
        const response = await axios.get(matchDataApiUrl)
        const matchData = response.data

        if (matchData.info.gameMode !== "CLASSIC" && matchData.info.queueId !== 420) {
            // await dropAnalyzed(matchId)
            return "next"
        }
        return matchData
    } catch (err) {
        if (!err.response) {
            console.log("라이엇으로부터 err.response가 없다! ")
            console.log(err)
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
}
