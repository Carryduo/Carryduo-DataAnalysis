const router = require("express").Router()
const matchDataController = require("./match.data.controller")

router.get("/", matchDataController.saveMatchData)
router.get("/champ-analysis", matchDataController.champAnalysis)
router.get("/winRate/:champId", matchDataController.Rate)

module.exports = router
