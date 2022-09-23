const router = require("express").Router()
const matchDataController = require("./match.data.controller")

router.get("/", matchDataController.saveMatchData)
router.get("/combination", matchDataController.analyzeCombination)
router.get("/combination/preview/:type", matchDataController.getAnalysis)

module.exports = router
