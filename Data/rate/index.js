const router = require("express").Router()
const rateController = require("./rate.controller")
const start = performance.now()
router.get("/champ", rateController.saveChampInfo) //챔프 Id

router.get("/rate", rateController.rate) // 승 패 벤

router.get("/position", rateController.position) // 포지션

router.get("/spell", rateController.champSpell) // 스펠

router.get("/save/rate", rateController.serviceSaveRate) // 챔프 승/ 픽/ 벤 연산 후 서비스 DB로 저장

router.get("/save/position", rateController.serviceSavePosition) //챔프 포지션 연산 후 서비스 DB로 저장

router.get("/save/spell", rateController.serviceSaveChampSpell) //챔프 스펠 정보 연산 후 서비스 DB로 저장

router.get("/save/redis", rateController.saveRedis)

const end = performance.now()
const runningTime = end - start
const ConversionRunningTime = (runningTime / (1000 * 60)) % 60
console.log(`==========================${ConversionRunningTime} 소요==========================`)

module.exports = router
