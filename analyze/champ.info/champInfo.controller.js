const { sleep } = require("../../timer/timer")
const logger = require("../../log")
const axios = require("axios")
const {
    matchIdList,
    getVersion,
    saveChampId,
    updateChampId,
    oldVersionSet,
    findSpellInfoData,
    updateChampSpellInfo,
    saveChampSpellInfo,
    successAnalyzed,
    dropAnalyzed,
} = require("./champInfo.service")

const { rate } = require("./champ.rate/rate.controller")
const { banRate } = require("./champ.ban/ban.controller")
const { position } = require("./champ.position/position.controller")
const { spell } = require("./champ.spell/spell.controller")
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

let key = 490
let status
//데이터 수집 및 분석 로직 실행
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
            // await rate(matchData, key)
            // await banRate(matchData, key)
            // await position(matchData, key)
            await spell(matchData)
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

//챔피언 id, name 저장 및 수정
exports.saveChampInfo = async () => {
    try {
        let champName = []

        const response = await axios.get(
            `https://ddragon.leagueoflegends.com/cdn/12.17.1/data/ko_KR/champion.json`
        )
        const champData = response.data.data

        champName.push(...Object.keys(champData))

        for (let i of champName) {
            await oldVersionSet(response.data.data[i].key)
            // await saveChampId(i, response.data.data[i].key)
            // await updateChampId(i, response.data.data[i].key)
        }
        return "챔피언ID 및 이름 저장 완료"
    } catch (err) {
        console.error(err)
        logger.error(err, { message: "- from saveChampInfo" })
        return
    }
}