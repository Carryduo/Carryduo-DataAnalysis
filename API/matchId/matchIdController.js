require("dotenv").config()
const axios = require("axios")
const { sleep } = require("../../timer")
const { findPuuId } = require("./matchIdService")
const { saveMatchId } = require("./matchIdService")

exports.getMatchId = async (req, res, next) => {
    try {
        let key = 0
        const puuIds = await findPuuId()
        let puuIdList = []
        let testPuuIdList = []
        for (let i of puuIds) {
            puuIdList.push(i.puuId)
        }

        for (let i = 0; i < 820; i++) {
            testPuuIdList.push(puuIdList[i])
        }

        async function getMatchId(puuIdList, num) {
            try {

                let matchId = []
                console.log("getMatchId 실행")
                const targetUsersApiUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuIdList[num]}/ids?start=0&count=1&api_key=${process.env.KEY}`
                const response = await axios.get(targetUsersApiUrl)

                if (!matchId.includes(...response.data)) {
                    matchId.push(...response.data)
                }
                matchId.map(async (value) => {
                    await saveMatchId(value)
                })
                console.log(num + " 번째 데이터 완료")
                key++
            } catch (err) {
                console.log(err)
                if (!err.response) {
                    console.log("err.response가 없다! " + err.message)
                    console.log(num + " 번째 부터 오류!")
                    return
                }
                if (err.response.status === 429) {
                    console.log("라이엇 요청 제한 경고!")
                    console.log(key + " 번째 부터 오류!")
                    await sleep(125)
                    return
                } else if (err.response.status === 403) {
                    console.log(key + " 번째 부터 오류!")
                    console.log("api키 갱신 필요!")
                    return
                } else {
                    console.log(err.response.status, err.response.statusText)
                    return
                }
            }
        }

        async function startGetMatchId() {
            while (key !== puuIdList.length + 1) {
                console.log(key + `번째`)
                await getMatchId(testPuuIdList, key)
            }
        }
        startGetMatchId()
        res.status(200).json({ result: "SUCCESS" })
    } catch (err) { }
}
