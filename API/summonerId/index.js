const router = require("express").Router()
const summonerController = require("./summonerIdController")

router.get("/", summonerController.getSummonerId)

module.exports = router
