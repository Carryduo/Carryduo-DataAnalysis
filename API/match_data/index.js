const router = require("express").Router()
const matchDataController = require("./match.data.controller")

router.get("/", matchDataController.saveMatchData)

module.exports = router
