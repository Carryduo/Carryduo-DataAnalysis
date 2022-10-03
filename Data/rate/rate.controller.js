const axios = require("axios")
const { getMatchData } = require("../match_data/match.data.service")
const {
    addWinCnt,
    addLoseCnt,
    saveChampId,
    addBanCnt,
    getMatchDataCnt,
    getChampList,
    ServiceSaveRate,
    champCnt,
} = require("./rate.service")

exports.Rate = async (req, res, next) => {
    const champs = await champCnt()
    if (!champs) {
        await getChampId()
        await rateAnalysis()
        await serviceSaveRate()
    } else {
        await rateAnalysis()
        await serviceSaveRate()
    }

    return res.status(200).json({})
}

async function serviceSaveRate() {
    const champList = await getChampList()
    const totalCnt = await getMatchDataCnt()

    for (let c of champList) {
        const champId = c.champ_champId

        let winRate = (c.champ_win / c.champ_sampleNum) * 100
        winRate = winRate.toFixed(2)

        let pickRate = (c.champ_sampleNum / totalCnt) * 100
        pickRate = pickRate.toFixed(2)

        let banRate = (c.champ_banCount / totalCnt) * 100
        banRate = banRate.toFixed(2)

        await ServiceSaveRate(champId, winRate, pickRate, banRate)
    }
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

async function getChampId() {
    try {
        let champName = []

        const response = await axios.get(
            `https://ddragon.leagueoflegends.com/cdn/12.17.1/data/ko_KR/champion.json`
        )
        const champData = response.data.data

        champName.push(...Object.keys(champData))

        for (let i of champName) {
            await saveChampId(i, response.data.data[i].key)
        }
    } catch (err) {
        console.log(err)
        return err
    }
}
