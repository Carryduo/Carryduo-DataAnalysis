const { sleep } = require("../timer/timer")
const { performance } = require("perf_hooks")

const matchDataController = require("../analyze/combination/combination.controller")
const { startChampInfo } = require("../analyze/champInfo/champInfo.controller")
const { serviceSavePosition } = require("../analyze/champInfo/champ.service.data/champ.position")
const { serviceSaveRate } = require("../analyze/champInfo/champ.service.data/champ.rate")
const { serviceSaveChampSpell } = require("../analyze/champInfo/champ.service.data/champ.spell")

const simulationController = require("../analyze/simulation/simulation.controller")
const { testRiotRequest } = require("../analyze/common.request")
const { AsyncTask } = require("toad-scheduler")

const logger = require("../log")

const task = new AsyncTask(
    "task",
    async () => {
        const response = await testRiotRequest()
        //데이터 분석 로직 수행
        if (response) {
            return await startAnalyze()
        } else {
            logger.info("라이엇API키 만료")
        }
    },
    (err) => {
        logger.error(err, { message: "- from task" })
    }
)

async function startAnalyze() {
    try {
        const start = performance.now()

        // 데이터 분석
        await startChampInfo()
        await matchDataController.saveCombination()
        await matchDataController.uploadCombinationWinRate()
        await matchDataController.updateCombinationTierAndRank()

        await simulationController.saveSimulation()
        await simulationController.uploadSimulationWinRate()

        await sleep(5)

        console.log("======서비스 DB 이관========")

        // 서비스 DB 이관
        await serviceSaveRate()
        await serviceSavePosition()
        await serviceSaveChampSpell()
        await matchDataController.transferCombinationStatToServiceDB()
        await simulationController.transferSimulationToServiceDB()
        //함수 실행 시간 체크
        const end = performance.now()
        const runningTime = end - start
        const ConversionRunningTime = (runningTime / (1000 * 60)) % 60
        logger.info(`=== 데이터 분석 ${ConversionRunningTime}분 소요`)
    } catch (err) {
        logger.error(err, { message: "- from startAnalyze" })
    }
}

module.exports = { task, startAnalyze }
