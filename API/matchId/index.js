const router = require("express").Router()
const matchIdController = require("./matchIdController")

router.get("/", matchIdController.getMatchId)

module.exports = router
