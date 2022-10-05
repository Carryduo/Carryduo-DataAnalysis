const axios = require("axios")
const {
    getMatchData,
    updateRate,
    saveChampId,
    addBanCnt,
    getMatchDataCnt,
    getChampList,
    ServiceSaveRate,
    champCnt,
    addPositionCnt,
    positionInfo,
    findSpellInfoData,
    updateChampSpellInfo,
    saveChampSpellInfo,
} = require("./rate.service")

exports.Rate = async (req, res, next) => {
    const start = performance.now()
    const champs = await champCnt()
    if (!champs) {
        await getChampId()
        await rateAnalysis()
        // await serviceSaveRate()
    } else {
        await rateAnalysis()
        // await serviceSaveRate()
    }
    const end = performance.now()
    const runningTime = end - start
    const ConversionRunningTime = (runningTime / 1000) % 60
    console.log(
        `==========================${ConversionRunningTime}분 소요==========================
         ===================================================================================        
        `
    )
    return res.status(200).json({})
}

async function serviceSaveRate() {
    const champList = await getChampList()
    const totalCnt = await getMatchDataCnt()

    for (let c of champList) {
        const champId = c.champ_champId
        const champPosition = await positionInfo(champId)

        const totalRate =
            champPosition[0].top +
            champPosition[0].jungle +
            champPosition[0].mid +
            champPosition[0].ad +
            champPosition[0].support

        let topRate = (champPosition[0].top / totalRate) * 100
        topRate = topRate.toFixed(2)

        let jungleRate = (champPosition[0].jungle / totalRate) * 100
        jungleRate = jungleRate.toFixed(2)

        let midRate = (champPosition[0].mid / totalRate) * 100
        midRate = midRate.toFixed(2)

        let adRate = (champPosition[0].ad / totalRate) * 100
        adRate = adRate.toFixed(2)

        let supportRate = (champPosition[0].support / totalRate) * 100
        supportRate = supportRate.toFixed(2)

        let winRate = (c.champ_win / c.champ_sampleNum) * 100
        winRate = winRate.toFixed(2)

        let pickRate = (c.champ_sampleNum / totalCnt) * 100
        pickRate = pickRate.toFixed(2)

        let banRate = (c.champ_banCount / totalCnt) * 100
        banRate = banRate.toFixed(2)

        await ServiceSaveRate(
            champId,
            winRate,
            pickRate,
            banRate,
            topRate,
            jungleRate,
            midRate,
            adRate,
            supportRate
        )
    }
}

async function rateAnalysis() {
    try {
        let cnt = 1
        const data = await getMatchData()

        for (let i of data) {
            console.log(
                `============================================${cnt}번============================================`
            )
            const matchId = i.matchData.metadata.matchId
            if (i.matchData.info.gameMode === "CLASSIC" && i.matchData.info.queueId === 420) {
                const participants = i.matchData.info.participants

                // 챔피언 스펠 정보 관련
                for (let v of participants) {
                    const champId = v.championId
                    const champName = v.championName
                    const spell1 = v.summoner1Casts
                    const spell2 = v.summoner2Casts

                    const spellData = await findSpellInfoData(champId, spell1, spell2)

                    if (!spellData) {
                        await saveChampSpellInfo(champId, champName, spell1, spell2, matchId)
                    } else if (spellData) {
                        await updateChampSpellInfo(champId, spell1, spell2, matchId)
                    }

                    // 챔피언 승/패 관련
                    let optionWinRate
                    if (v.win) {
                        optionWinRate = {
                            set: { win: () => "win+1", sampleNum: () => "sampleNum+1" },
                        }
                    } else {
                        optionWinRate = {
                            set: { lose: () => "lose+1", sampleNum: () => "sampleNum+1" },
                        }
                    }

                    await updateRate(champId, optionWinRate, matchId)

                    //챔피언 포지션 비율 관련
                    let optionPosition
                    if (!v.teamPosition) {
                        continue
                    }
                    switch (v.teamPosition) {
                        case "TOP":
                            optionPosition = {
                                set: { top: () => "top+1" },
                            }
                            break
                        case "JUNGLE":
                            optionPosition = {
                                set: { jungle: () => "jungle+1" },
                            }
                            break
                        case "MIDDLE":
                            optionPosition = {
                                set: { mid: () => "mid+1" },
                            }
                            break
                        case "BOTTOM":
                            optionPosition = {
                                set: { ad: () => "ad+1" },
                            }
                            break
                        case "UTILITY":
                            optionPosition = {
                                set: { support: () => "support+1" },
                            }
                            break
                    }
                    await addPositionCnt(champId, optionPosition, matchId)
                }

                //챔피언 밴률 관련
                const teams = i.matchData.info.teams
                for (let t of teams) {
                    const ban = t.bans
                    for (let b of ban) {
                        const champId = b.championId
                        if (b.chmapionId === -1) continue
                        await addBanCnt(champId, matchId)
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
