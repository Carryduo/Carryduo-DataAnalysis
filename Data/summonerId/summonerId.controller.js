const axios = require("axios")
const { sleep } = require("../../timer")
const { saveSummonerId } = require("./summonerId.service")
require("dotenv").config()

exports.summonerId = async (req, res, next) => {
    try {
        res.status(200).json({ result: "SUCCESS" })
    } catch (err) {}
}

let summonerIds = []
let page = 1
let errStatus = 0

async function startGetSummonerId() {
    while (page !== 6) {
        console.log("while문 진입", "status: " + page)
        await getSummonerId(summonerIds, page)
    }
}

async function getSummonerId(summonerIds, num) {
    console.log("getSummonerId 실행")

    const tier = "PLATINUM"
    const tierDivisionList = ["I", "II", "III", "IV"]

    for (let division of tierDivisionList) {
        console.log(num + " 번째 요청")

        const targetTierUsersApiUrl = `https://kr.api.riotgames.com/lol/league/v4/entries/RANKED_SOLO_5x5/${tier}/${division}?page=${num}&api_key=${process.env.KEY}`

        const response = await axios.get(targetTierUsersApiUrl).catch(async (err) => {
            if (err.response.status === 429) {
                console.log("getSummonerId 라이엇 요청 제한 경고!")
                console.log(err.response.statusText)
                console.log(`${num}부터 오류`)
                await sleep(125)
                return (errStatus = 429)
            } else if (err.response.status === 403) {
                console.log("api키 갱신 필요!")
                return
            } else {
                console.log(err.response.status, err.response.statusText)
                return
            }
        })

        if (errStatus !== 429) {
            const targetUsersData = response.data
            for (let value of targetUsersData) {
                if (!summonerIds.includes(value.summonerId)) {
                    summonerIds.push(value.summonerId)
                    await saveSummonerId(value.summonerId)
                }
            }
        } else {
            errStatus = 0
            page -= 1
            break
        }
    }

    page++
}
