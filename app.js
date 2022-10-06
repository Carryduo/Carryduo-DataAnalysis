require("dotenv").config()

const express = require("express")
const app = express()
const Router = require("./routes")
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use("/", Router)
const db = require("./orm")

const summonerController = require("./data/summonerId/summonerId.controller")
const puuidController = require("./data/puuId/puuId.controller")
const matchDataController = require("./data/match_data/match.data.controller")
const matchIdController = require("./data/matchId/matchId.controller")
const { sleep } = require("./timer")
const schedule = require('node-schedule')
// db.connect()
// db.connectService()
// const redisClient = require("./redis")

// redisClient.connect().then()

// schedule.scheduleJob(' */1 * * * *', () => {
//     console.log('1분 주기입니다')
// })
// TODO: 스케줄링을 걸되, API카 만료되지 않은 상황일때에만 작업 시작할 수 있게 하기.
startAnalyze()

async function startAnalyze() {
    const startDate = new Date()
    await db.connect()
    await db.connectService()
    // 로우데이터 수집
    await sleep(10)
    // matchData 조회 및 combination으로 데이터 분석
    await summonerController.summonerId()
    await sleep(10) // setTimmer를 이용해서 db가 온전히 연결된 이후에 데이터 분석 시작
    await puuidController.puuId()
    await sleep(10)
    await matchIdController.matchId()
    await sleep(10)

    // 데이터 분석
    await matchDataController.saveCombination()
    await sleep(10)
    await matchDataController.uploadCombinationWinRate()
    await sleep(10)
    await matchDataController.updateCombinationTierAndRank()
    await sleep(10)
    await matchDataController.transferCombinationStatToServiceDB()
    const endDate = new Date()
    console.log((endDate - startDate) / 1000, "초") // 데이터분석까지 걸린 시간 체크
}

module.exports = app
