const router = require("express").Router()
const champIdRouter = require("../data/champId")
const summonerIdRouter = require("../data/summonerId")
const puuIdRouter = require("../data/puuId")
const matchIdRouter = require("../data/matchId")
const matchDataRouter = require("../data/match_data")
const rateRouter = require("../Data/rate/")
const summonerHistoryRouter = require("../Data/summoner_history")

router.use("/champId", champIdRouter)
router.use("/summonerId", summonerIdRouter)
router.use("/puuId", puuIdRouter)
router.use("/matchId", matchIdRouter)
router.use("/match-data", matchDataRouter)
router.use("/rate", rateRouter)
router.use("/history", summonerHistoryRouter)

module.exports = router
