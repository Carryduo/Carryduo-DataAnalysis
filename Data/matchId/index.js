const router = require("express").Router()
const matchIdController = require("./matchId.controller")

router.get("/", matchIdController.matchId)

module.exports = router
