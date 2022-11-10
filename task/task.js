const { sleep } = require("../timer/timer")
const { performance } = require("perf_hooks")

const { testRiotRequest } = require("../analyze/common.request")

const { champInfoToService } = require("../analyze/champ/champ.service/data.save.controller")

const combinationController = require("../analyze/combination/combination.controller")
const simulationController = require("../analyze/simulation/simulation.controller")
const dataRetirementController = require("../analyze/data-retirement/data.retirement.controller")

const {
    startChampDataSave,
    startChampCalculation,
    saveChampDataToServiceDB,
} = require("../analyze/champ/champ.index")

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

        await champInfoToService()
        await startChampDataSave()
        await startChampCalculation()

        await combinationController.saveCombination()
        await combinationController.uploadCombinationWinRate()
        await combinationController.updateCombinationTierAndRank()

        await sleep(5)

        console.log("======서비스 DB 이관========")

        // // 서비스 DB 이관
        await saveChampDataToServiceDB()
        await combinationController.transferCombinationStatToServiceDB()

        // 오래된 데이터 삭제
        await dataRetirementController.deleteOutdatedData("combination")
        await dataRetirementController.deleteOutdatedData("winRate")
        await dataRetirementController.deleteOutdatedData("banRate")
        await dataRetirementController.deleteOutdatedData("position")
        await dataRetirementController.deleteOutdatedData("spell")
        await dataRetirementController.deleteOutdatedData("champ_service")
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
