const { sleep } = require('../timer/timer')
const { performance } = require('perf_hooks')

const { testRiotRequest } = require('../analyze/common.request')

const { champInfoToService } = require('../analyze/champ/champ.service/data.save.controller')

const combinationController = require('../analyze/combination/combination.controller')
const dataRetirementController = require('../analyze/data-retirement/data.retirement.controller')

const {
    startChampDataSave,
    startChampCalculation,
    saveChampDataToServiceDB,
} = require('../analyze/champ/champ.index')

const logger = require('../log')

const db = require('../orm')
const ServiceDB = require('../service.orm')

process.on('message', async function (m) {
    const start = performance.now()
    let done
    const response = await testRiotRequest()
    const cpuUsage = process.cpuUsage()
    if (m === 'connect') {
        await db.connect()
        await ServiceDB.connectService()
        done = 'connect'
    }

    if (response) {
        if (m.parameter === 6) {
            await sleep(10)
            await analyzedData()
            console.log('분석 작업 완료')
            console.log(process.cpuUsage(cpuUsage))
            done = 'analyze'
        } else if (m.parameter === 12) {
            await sleep(10)
            await transferData()
            console.log('이관 작업 완료')
            console.log(process.cpuUsage(cpuUsage))
            done = 'transfer'
        } else {
            await sleep(10)
            await collectData()
            console.log('수집 작업 완료')
            console.log(process.cpuUsage(cpuUsage))
            done = 'collect'
        }
        const end = performance.now()
        const runningTime = end - start
        const ConversionRunningTime = String(runningTime / (1000 * 60) / 60).split('.')[0]
        const ConversionRunningMinute = (runningTime / (1000 * 60)) % 60
        logger.info(
            `===${m.parameter} 번째 작업:${done} ${ConversionRunningTime}시간 ${ConversionRunningMinute}분 소요===`
        )
        process.send({ parameter: m.parameter, done })
    } else {
        process.send({ parameter: m.parameter, done: 'API expiration' })
    }
})

async function collectData() {
    await champInfoToService()
    await startChampDataSave()
    await combinationController.saveCombination()
}

async function analyzedData() {
    await startChampCalculation()
    await combinationController.uploadCombinationWinRate()
    await combinationController.updateCombinationTierAndRank()
}

async function transferData() {
    // 오래된 데이터 삭제
    await dataRetirementController.deleteOutdatedData('combination')
    await dataRetirementController.deleteOutdatedData('winRate')
    await dataRetirementController.deleteOutdatedData('banRate')
    await dataRetirementController.deleteOutdatedData('position')
    await dataRetirementController.deleteOutdatedData('spell')
    // // 서비스 DB 이관 및 서비스 DB에서 오래된 데이터 삭제
    await saveChampDataToServiceDB()
    await combinationController.transferCombinationStatToServiceDB()
    await dataRetirementController.deleteOutdatedData('champ_service')
    await dataRetirementController.deleteOutdatedData('combination_service')
}

process.on('exit', () => {
    console.log('dataAnalyze process out')
})
