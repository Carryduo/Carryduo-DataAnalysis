const router = require("express").Router()
const historyController = require("./history.controller")

router.get("/", historyController.history)

module.exports = router
