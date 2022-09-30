const { getMatchData } = require("../match_data/match.data.service")
const { addWinCnt, addLoseCnt, targetChamp, getMatchDataCnt, addBanCnt } = require("./rate.service")

exports.Rate = async (req, res, next) => {
    const { champId } = req.params
    const totalCnt = await getMatchDataCnt()
    const champ = await targetChamp(champId)

    let winRate = (champ.win / champ.sampleNum) * 100
    winRate = winRate.toFixed(2)
    let pickRate = (champ.sampleNum / totalCnt) * 100
    pickRate = pickRate.toFixed(2)
    let banRate = (champ.banCount / totalCnt) * 100
    banRate = banRate.toFixed(2)

    return res.status(200).json({ winRate, pickRate, banRate })
}

async function rateAnalysis() {
    try {
        let cnt = 1
        const data = await getMatchData()

        for (let i of data) {
            console.log(`${cnt}번`)
            if (i.matchData.info.gameMode === "CLASSIC" && i.matchData.info.queueId === 420) {
                const participants = i.matchData.info.participants
                for (let v of participants) {
                    if (v.win) {
                        await addWinCnt(v.championId)
                    } else {
                        await addLoseCnt(v.championId)
                    }
                }

                const teams = i.matchData.info.teams
                for (let t of teams) {
                    const ban = t.bans
                    for (let b of ban) {
                        if (b.chmapionId === -1) continue
                        await addBanCnt(b.championId)
                    }
                }
            }
            cnt++
        }
        console.log("완료!")
        return
    } catch (err) {
        console.log(err)
    }
}
