const router = require("express").Router()
const puuIdController = require("./puuIdController")

router.get("/", puuIdController.getPuuId)

module.exports = router
