const router = require("express").Router()
const summonerController = require("./summonerId.controller")

router.get("/", summonerController.summonerId)

module.exports = router
