const router = require("express").Router()
const champIdRouter = require("../API/champId")
const summonerIdRouter = require("../API/summonerId")
const puuIdRouter = require("../API/puuId")
const matchIdRouter = require("../API/matchId")
const matchDataRouter = require('../API/match_data')

router.use("/champId", champIdRouter)
router.use("/summonerId", summonerIdRouter)
router.use("/puuId", puuIdRouter)
router.use("/matchId", matchIdRouter)
router.use("/match-data", matchDataRouter)

module.exports = router
