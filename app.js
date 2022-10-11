require("dotenv").config()
const fs = require("fs")
const { performance } = require("perf_hooks")
const express = require("express")
const app = express()
const Router = require("./routes")
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use("/", Router)
const db = require("./orm")

const { sleep } = require("./timer")
const schedule = require("node-schedule")
const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require("toad-scheduler")
const summonerController = require("./data/summonerId/summonerId.controller")
const puuidController = require("./data/puuId/puuId.controller")
const matchDataController = require("./data/match_data/match.data.controller")
const matchIdController = require("./data/matchId/matchId.controller")
const {
    startChampInfo,
    serviceSaveRate,
    serviceSavePosition,
    serviceSaveChampSpell,
} = require("./data/rate/rate.controller")

// schedule.scheduleJob(' */1 * * * *', () => {
//     console.log('1분 주기입니다')
// })
// TODO: 스케줄링을 걸되, API카 만료되지 않은 상황일때에만 작업 시작할 수 있게 하기.

// startAnalyze()

const scheduler = new ToadScheduler()

const task = new AsyncTask(
    "task",
    async () => {
        //데이터베이스 연결
        await db.connect()
        await db.connectService()

        //데이터 분석 로직 수행
        return await startAnalyze()
    },
    (err) => {
        const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0]
        const time = new Date().toTimeString().split(" ")[0]
        const data = "\nerror: " + err.toString() + " ||" + " Date: " + date + " Time: " + time

        fs.writeFile(
            process.env.SCHEDUL_LOG || `./logs/schedule.error.txt`,
            data,
            { flag: "a+" },
            (err) => {
                console.log(err)
            }
        )
    }
)

const matchIdTask = new AsyncTask(
    "task",
    async () => {
        //데이터베이스 연결
        await db.connect()
        await db.connectService()

        //데이터 분석 로직 수행
        return await startGetMatchIds()
    },
    (err) => {
        const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0]
        const time = new Date().toTimeString().split(" ")[0]
        const data = "\nerror: " + err.toString() + " ||" + " Date: " + date + " Time: " + time

        fs.writeFile(
            process.env.SCHEDUL_LOG || `./logs/schedule.error.txt`,
            data,
            { flag: "a+" },
            (err) => {
                console.log(err)
            }
        )
    }
)

// 데이터 분석
const job = new SimpleIntervalJob({ hours: 2, runImmediately: true }, task)
// scheduler.addSimpleIntervalJob(job)

// 매치Id 수집 
const matchIdJob = new SimpleIntervalJob({ hours: 12, runImmediately: true }, matchIdTask) // runImmediately: 즉시실행 
scheduler.addSimpleIntervalJob(matchIdJob)



// async function startAnalyze() {
//     try {
//         const start = performance.now()

//         //데이터 분석 및 분석용 데이터베이스에 저장
//         await startChampInfo()
//         await sleep(10)

//         // 데이터 분석 후 서비스DB에 업데이트
//         await serviceSaveRate()
//         await sleep(10)

//         await serviceSavePosition()
//         await sleep(10)

//         await serviceSaveChampSpell()
//         await sleep(10)

//         console.log('======챔피언조합승률 분석 시작========')

//         await matchDataController.saveCombination()
//         await sleep(10)
//         await matchDataController.uploadCombinationWinRate()
//         await sleep(10)
//         await matchDataController.updateCombinationTierAndRank()
//         await sleep(10)
//         await matchDataController.transferCombinationStatToServiceDB()

//         //데이터베이스 연결 해제
//         await db.close()
//         await db.closeService()

//         //함수 실행 시간 체크
//         const end = performance.now()
//         const runningTime = end - start
//         const ConversionRunningTime = (runningTime / (1000 * 60)) % 60
//         console.log(`===${ConversionRunningTime} 분소요===`)
//     } catch (err) {
//         //에러 로그 파일
//         const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0]
//         const time = new Date().toTimeString().split(" ")[0]
//         const data = "\nerror: " + err.toString() + " ||" + " Date: " + date + " Time: " + time

//         fs.writeFile(
//             process.env.LOG || `./logs/champ.analyze.error.txt`,
//             data,
//             { flag: "a+" },
//             (err) => {
//                 console.log(err)
//             }
//         )
//     }
// }


async function startGetMatchIds() {
    try {
        const start = performance.now()
        // 로우데이터 수집
        await sleep(10)
        await summonerController.summonerId()
        await sleep(10) // setTimmer를 이용해서 db가 온전히 연결된 이후에 데이터 분석 시작
        await puuidController.puuId()
        await sleep(10)
        await matchIdController.matchId()
        await sleep(10)

        //데이터베이스 연결 해제
        await db.close()
        await db.closeService()

        const end = performance.now()
        const runningTime = end - start
        const ConversionRunningTime = (runningTime / (1000 * 60)) % 60
        console.log(`===${ConversionRunningTime} 분소요===`)
    } catch (error) {
        const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0]
        const time = new Date().toTimeString().split(" ")[0]
        const data = "\nerror: " + err.toString() + " ||" + " Date: " + date + " Time: " + time

        fs.writeFile(
            process.env.LOG || `./logs/champ.analyze.error.txt`,
            data,
            { flag: "a+" },
            (err) => {
                console.log(err)
            }
        )
    } // 데이터분석까지 걸린 시간 체크
}

module.exports = app
