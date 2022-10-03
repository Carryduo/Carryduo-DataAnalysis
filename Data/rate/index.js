const router = require("express").Router()
const rateController = require("./rate.controller")

router.get("/", rateController.Rate)

module.exports = router
