require("dotenv").config()
const axios = require("axios")
const { sleep } = require("../../timer")
const { findPuuId, saveMatchId, findMatchId } = require("./matchId.service")

exports.matchId = async (req, res, next) => {
    try {
        const result = await startGetMatchId()
        res.status(200).json({ result })
    } catch (err) {
        console.log(err)
    }
}

let key = 0
let matchId = []
async function startGetMatchId() {
    const puuIds = await findPuuId()

    console.log(puuIds.length)
    while (key !== puuIds.length + 1) {
        console.log(key + `번째`)
        await getMatchId(puuIds, key)
    }
    return puuIds
}

async function getMatchId(puuIds, num) {
    try {

        console.log("getMatchId 실행")
        const targetUsersApiUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuIds[num].puuid}/ids?start=0&count=5&api_key=${process.env.KEY}`
        const response = await axios.get(targetUsersApiUrl)

        const currentMatchId = response.data
        if (!matchId.includes(...currentMatchId)) {
            matchId.push(...currentMatchId)
        }
        currentMatchId.map(async (value) => {
            const data = await saveMatchId(value, puuIds[num].tier, puuIds[num].division, puuIds[num].summonerId, puuIds[num].puuid)
            //    중복값 넘어가기
            if (data.code === 1062) {
                console.log('중복이야')
                console.log(num + " 번째 부터 오류!")
                return
            } else {
                console.log(data)
            }
            return
        })
        console.log(num + " 번째 데이터 완료")
        return key++
    } catch (err) {
        if (!err.response) {
            console.log("err.response가 없다! " + err.message)
            console.log(num + " 번째 부터 오류!")
        }
        if (err.response.status === 429) {
            console.log("라이엇 요청 제한 경고!")
            console.log(key + " 번째 부터 오류!")
            await sleep(125)
        } else if (err.response.status === 403) {
            console.log(key + " 번째 부터 오류!")
            console.log("api키 갱신 필요!")
        } else {
            console.log(err.response.status, err.response.statusText)
        }
        return key++
    }
}
