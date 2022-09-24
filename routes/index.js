const router = require("express").Router()
const champIdRouter = require("../Data/champId")
const summonerIdRouter = require("../Data/summonerId")
const puuIdRouter = require("../Data/puuId")
const matchIdRouter = require("../Data/matchId")
const matchDataRouter = require("../Data/match_data")

router.use("/champId", champIdRouter)
router.use("/summonerId", summonerIdRouter)
router.use("/puuId", puuIdRouter)
router.use("/matchId", matchIdRouter)
router.use("/match-data", matchDataRouter)

module.exports = router
