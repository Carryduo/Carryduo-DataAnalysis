require("dotenv").config()
const axios = require("axios")
const { sleep } = require("../../timer")
const { savePuuId } = require("./puuIdService")
const { findSummonerId } = require("./puuIdService")

exports.getPuuId = async (req, res, next) => {
    let key = 0
    let puuIds = []
    const summonerIds = await findSummonerId()
    let summonerIdList = []
    for (let i of summonerIds) {
        summonerIdList.push(i.summonerId)
    }

    async function getPuuId(summonerIdList, num) {
        try {
            console.log("getPuuId 실행")
            const targetUsersApiUrl = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${summonerIdList[num]}?api_key=${process.env.KEY}`
            const response = await axios.get(targetUsersApiUrl)
            const targetUsersPuuId = response.data.puuid
            if (!puuIds.includes(targetUsersPuuId)) {
                puuIds.push(targetUsersPuuId)
                await savePuuId(targetUsersPuuId)
                console.log(num + " 번째 데이터 완료")
            }
            key++
        } catch (err) {
            if (!err.response) {
                console.log("err.response가 없다! " + err)
                console.log(num + " 번째 부터 오류!")
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

    async function startGetPuuId() {
        while (key !== summonerIdList.length + 1) {
            await getPuuId(summonerIdList, key)
        }
    }
    startGetPuuId()

    res.status(200).json({ result: "SUCCESS", summonerIdList })
}
