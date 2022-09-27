require("dotenv").config()
const axios = require("axios")
const { sleep } = require("../../timer")
const { findSummonerId, savePuuId } = require("./puuId.service")

exports.puuId = async (req, res, next) => {
    const result = await startGetPuuId()
    res.status(200).json({ result })
}

let key = 0

async function startGetPuuId() {
    const summonerIds = await findSummonerId()
    while (key !== summonerIds.length) {
        await getPuuId(summonerIds, key)
        key++
    }
    return 'success'
}

async function getPuuId(summonerIds, key) {
    try {
        let puuIds = []
        console.log("getPuuId 실행")
        const targetUsersApiUrl = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${summonerIds[key].summonerId}?api_key=${process.env.KEY}`
        const response = await axios.get(targetUsersApiUrl)
        const targetUsersPuuId = response.data.puuid
        if (!puuIds.includes(targetUsersPuuId)) {
            puuIds.push(targetUsersPuuId)
            console.log(targetUsersPuuId)
            savePuuId(targetUsersPuuId, summonerIds[key].tier, summonerIds[key].division, summonerIds[key].summonerId)
            console.log(key + " 번째 데이터 완료")
        }
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
            return
        }
    }
}
