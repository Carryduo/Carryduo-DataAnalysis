const { sleep } = require("../timer/timer")
const { performance } = require("perf_hooks")
const db = require("../orm")
const { taskErrLogging, analyzeErrLogging, apiKeyStatusLogging } = require("../logging/log")

const matchDataController = require("../analyze/match_data/match.data.controller")
const simulationController = require("../analyze/match_data/simulation.controller")
const {
    startChampInfo,
    serviceSaveRate,
    serviceSavePosition,
    serviceSaveChampSpell,
} = require("../analyze/champInfo/champInfo.controller")

const { testRiotRequest } = require("../analyze/common.request")
const { AsyncTask } = require("toad-scheduler")

const task = new AsyncTask(
    "task",
    async () => {
        const response = await testRiotRequest()
        //데이터 분석 로직 수행
        if (response) {
            return await startAnalyze()
        } else {
            apiKeyStatusLogging()
        }
    },
    (err) => {
        taskErrLogging(err)
    }
)

async function startAnalyze() {
    try {
        const start = performance.now()

        //데이터 분석 및 분석용 데이터베이스에 저장
        await startChampInfo()
        await sleep(10)

        // 데이터 분석 후 서비스DB에 업데이트
        await serviceSaveRate()
        await sleep(10)

        await serviceSavePosition()
        await sleep(10)

        await serviceSaveChampSpell()
        await sleep(10)

        // console.log("======챔피언조합승률 분석 시작========")

        await matchDataController.saveCombination()
        await sleep(10)
        await matchDataController.uploadCombinationWinRate()
        await sleep(10)
        await matchDataController.updateCombinationTierAndRank()
        await sleep(10)
        await matchDataController.transferCombinationStatToServiceDB()

        //함수 실행 시간 체크
        const end = performance.now()
        const runningTime = end - start
        const ConversionRunningTime = (runningTime / (1000 * 60)) % 60
        console.log(`===${ConversionRunningTime} 분소요===`)
    } catch (err) {
        analyzeErrLogging(err)
    }
}

module.exports = { task }
