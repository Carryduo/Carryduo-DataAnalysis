const router = require("express").Router()
const champIdController = require("./champIdController")

router.get("/", champIdController.getChampId)

module.exports = router
