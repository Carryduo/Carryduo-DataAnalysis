const router = require("express").Router()
const rateController = require("./rate.controller")

router.get("/:champId", rateController.Rate)

module.exports = router
