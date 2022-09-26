const router = require("express").Router()
const summonerController = require("./summonerId.controller")

router.get("/", summonerController.summonerId)
router.get("/test", summonerController.test)

module.exports = router
