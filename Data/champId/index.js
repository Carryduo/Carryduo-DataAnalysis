const router = require("express").Router()
const champIdController = require("./champId.controller")

router.get("/", champIdController.getChampId)

module.exports = router
