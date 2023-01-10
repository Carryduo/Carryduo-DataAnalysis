const { sleep } = require('../timer/timer')
const { performance } = require('perf_hooks')

const { testRiotRequest } = require('../analyze/common.request')

const { updateNewChampDefaultImage, checkVersion, updateNewVersionChampInfoFromRiot } = require('../analyze/champ/champ.service/data.save.controller')

const combinationController = require('../analyze/combination/combination.controller')
const dataRetirementController = require('../analyze/data-retirement/data.retirement.controller')

const { deleteOutdatedS3Bucket } = require('../analyze/champ/champ.service/data.save.s3.service')
const {
    startChampDataSave,
    startChampCalculation,
    saveChampDataToServiceDB,
} = require('../analyze/champ/champ.index')

const logger = require('../log')

const db = require('../orm')
const ServiceDB = require('../service.orm')

process.on('message', async function (m) {
    try {
        const start = performance.now()
        let done
        const response = await testRiotRequest()
        const cpuUsage = process.cpuUsage()
        if (response) {
            if (m.parameter === 0) {
                await db.connect()
                await ServiceDB.connectService()
                console.log('DB 연결 작업 완료')
                done = 'connect'
            }
            else if (m.parameter === 6) {
                done = 'analyze'
                await sleep(10)
                await analyzedData()
                console.log('분석 작업 완료')
                console.log(process.cpuUsage(cpuUsage))
            }
            else if (m.parameter === 12) {
                done = 'transfer'
                await sleep(10)
                await updateNewChampDefaultImage()
                await checkVersionForImageUpdate(done)
                await transferData()
                console.log('이관 작업 완료')
                console.log(process.cpuUsage(cpuUsage))
            }
            else {
                done = 'collect'
                await sleep(10)
                await collectData()
                console.log('수집 작업 완료')
                console.log(process.cpuUsage(cpuUsage))
            }
            const end = performance.now()
            const runningTime = end - start
            const ConversionRunningTime = String(runningTime / (1000 * 60) / 60).split('.')[0]
            const ConversionRunningMinute = (runningTime / (1000 * 60)) % 60
            logger.info(
                `===${m.parameter} 번째 작업:${done} ${ConversionRunningTime}시간 ${ConversionRunningMinute}분 소요===`
            )
        } else {
            done = 'API expiration'
        }
        process.send({ parameter: m.parameter, done })
    } catch (err) {
        logger.error(err, { message: '--from task' })
        process.send({ parameter: m.parameter, done: 'error' })
    }
})

async function checkVersionForImageUpdate(done) {
    try {
        const { param, version, oldVersion } = await checkVersion()
        if (param === 1) {
            logger.info(`라이엇 패치버전이 더 높습니다. ${done} 작업 전에 이미지 업데이트를 시작합니다.`)
            await updateNewVersionChampInfoFromRiot(version)
            await deleteOutdatedS3Bucket(oldVersion)
            logger.info('라이엇 패치버전에 따라 이미지 업데이트 완료.')
        } else if (param === 0) {
            logger.info('라이엇과 DB 패치버전이 동일합니다.')
        } else {
            logger.info('DB 버전이 라이엇 버전보다 높습니다.')
        }
    } catch (err) {
        logger.error(err, { message: 'from checkVersionForImageUpdate' })
    }
}

async function collectData() {
    try {
        await updateNewChampDefaultImage()
        await startChampDataSave()
        await combinationController.saveCombination()
    } catch (err) {
        logger.error(err, { message: 'from collectData' })
        return err
    }
}

async function analyzedData() {
    try {
        await updateNewChampDefaultImage()
        await startChampCalculation()
    } catch (err) {
        logger.error(err, { message: 'from analyedData' })
        return err
    }
}

async function transferData() {
    // 오래된 데이터 삭제
    try {

        await dataRetirementController.deleteOutdatedData('combination')
        await dataRetirementController.deleteOutdatedData('winRate')
        await dataRetirementController.deleteOutdatedData('banRate')
        await dataRetirementController.deleteOutdatedData('position')
        await dataRetirementController.deleteOutdatedData('spell')
        // // 서비스 DB 이관 및 서비스 DB에서 오래된 데이터 삭제
        await saveChampDataToServiceDB()
        await combinationController.transferCombinationStatToServiceDB()
        await dataRetirementController.deleteOutdatedData('combination_service')
        await dataRetirementController.deleteOutdatedData('champ_service')
    } catch (err) {
        logger.error(err, { message: 'from transferData' })
        return err
    }
}

process.on('exit', () => {
    console.log('dataAnalyze process out')
})
