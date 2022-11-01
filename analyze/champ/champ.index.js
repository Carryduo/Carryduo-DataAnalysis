const { sleep } = require("../../timer/timer")
const logger = require("../../log")
const axios = require("axios")

const { matchIdList, saveMatchIdVersion, dropAnalyzed } = require("./champ.common.service")
const {
    winRate,
    banRate,
    winPickRateCalculation,
    banRateCalculation,
} = require("./champ.rate/rate.controller")

const { position, positionCalculation } = require("./champ.position/position.controller")
const { spell, spellCaculation } = require("./champ.spell/spell.controller")
const { rateDataToService, spellDataToService } = require("./champ.service/data.save.controller")

let key = 0
let status
exports.startChampDataSave = async () => {
    try {
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
            await position(matchData, key)
            await winRate(matchData, key)
            await banRate(matchData, key)
            await spell(matchData, key)

            key++
        }
        key = 0
        logger.info("승/밴/픽, 스펠, 포지션 데이터분석완료")
        return
    } catch (err) {
        logger.error(err, { message: "- from startChampDataSave" })
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
            await dropAnalyzed(matchId)
            return "next"
        }
        const version = matchData.info.gameVersion.substring(0, 5)
        await saveMatchIdVersion(matchId, version)
        return matchData
    } catch (err) {
        if (!err.response) {
            logger.error(err, { message: key + " 번째 부터 오류!" })
            return key++
        }
        if (err.response.status === 429) {
            logger.error(err, { message: key + " 번째 부터 오류!" })
            await sleep(125)
            return
        } else if (err.response.status === 403) {
            logger.error(err, { message: key + "api키 갱신 필요!" })
            return
        } else {
            logger.error(err)
            status = err.response.status
            return key++
        }
    }
}

exports.startChampCalculation = async () => {
    try {
        await positionCalculation()
        await winPickRateCalculation()
        await banRateCalculation()
        await spellCaculation()
    } catch (err) {
        logger.error(err, { message: "- from startChampCalculation" })
    }
}

exports.saveChampDataToServiceDB = async () => {
    try {
        await rateDataToService()
        await spellDataToService()
    } catch (err) {
        logger.error(err, { message: "- from saveToServiceDB" })
    }
}
