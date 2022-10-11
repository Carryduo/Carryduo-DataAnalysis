const router = require("express").Router()
const puuIdController = require("./puuId.controller")

router.get("/", puuIdController.puuId)

module.exports = router
