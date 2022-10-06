const fs = require("fs")
const axios = require("axios")
const {
    updateRate,
    saveChampId,
    addBanCnt,
    getMatchDataCnt,
    getChampList,
    ServiceSaveRate,
    addPositionCnt,
    positionInfo,
    findSpellInfoData,
    updateChampSpellInfo,
    saveChampSpellInfo,
    spellTotalCnt,
    findSpellData,
    ServiceSaveSpell,
    ServicePosition,
    successAnalyzed,
    ServicefindSpellInfoData,
    ServiceUpdateChampSpellInfo,
} = require("./rate.service")

// exports.Rate = async (req, res, next) => {
//     const start = performance.now()
//     await champDataAnalysis()
//     await serviceSaveData()
//     const end = performance.now()
//     const runningTime = end - start
//     const ConversionRunningTime = (runningTime / (1000 * 60)) % 60
//     console.log(`==========================${ConversionRunningTime} 소요==========================`)
//     return res.status(200).json({})
// }

//==========================================================================================================//
//챔프 스펠 정보 연산 후 서비스 DB로 저장

exports.serviceSaveChampSpell = async (req, res, next) => {
    try {
        const champList = await getChampList()

        for (let c of champList) {
            const spellData = await findSpellData(c.champ_champId)
            for (let s of spellData) {
                const spell1 = s.champspell_spell1
                const spell2 = s.champspell_spell2
                const champId = s.champspell_champId
                const sampleNum = s.champspell_sampleNum
                const spellTotal = await spellTotalCnt(champId)
                let pickRate = (s.champspell_sampleNum / spellTotal.total) * 100
                pickRate = pickRate.toFixed(2)

                const spellData = await ServicefindSpellInfoData(champId, spell1, spell2)

                if (!spellData) {
                    await ServiceSaveSpell(champId, spell1, spell2, pickRate, sampleNum)
                } else if (spellData) {
                    await ServiceUpdateChampSpellInfo(champId, spell1, spell2, pickRate, sampleNum)
                }
            }
        }

        return res.status(200).json({ success: true })
    } catch (err) {
        return err
    }
}

//==========================================================================================================//
//챔프 포지션 연산 후 서비스 DB로 저장
exports.serviceSavePosition = async (req, res, next) => {
    try {
        const champList = await getChampList()

        for (let c of champList) {
            const champId = c.champ_champId

            const champPosition = await positionInfo(champId)

            // 해당 챔피언의 모든 포지션 카운트를 더해 총 카운트를 찾는다.
            const totalRate =
                champPosition[0].top +
                champPosition[0].jungle +
                champPosition[0].mid +
                champPosition[0].ad +
                champPosition[0].support

            //챔피언 포지션 비율 연산
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

            await ServicePosition(champId, topRate, jungleRate, midRate, adRate, supportRate)
        }
        return res.status(200).json({ success: true })
    } catch (err) {
        return err
    }
}
//==========================================================================================================//
// 챔프 승/ 픽/ 벤 연산 후 서비스 DB로 저장
exports.serviceSaveRate = async (req, res, next) => {
    try {
        const champList = await getChampList()
        const totalCnt = await getMatchDataCnt()

        for (let c of champList) {
            const champId = c.champ_champId

            //챔피언 승, 픽, 밴 연산
            let winRate = (c.champ_win / c.champ_sampleNum) * 100
            winRate = winRate.toFixed(2)

            let pickRate = (c.champ_sampleNum / totalCnt) * 100
            pickRate = pickRate.toFixed(2)

            let banRate = (c.champ_banCount / totalCnt) * 100
            banRate = banRate.toFixed(2)

            await ServiceSaveRate(champId, winRate, pickRate, banRate)
        }
        return res.status(200).json({ success: true })
    } catch (err) {
        return err
    }
}

//==========================================================================================================//
//챔프 스펠 정보 저장
exports.champSpell = async (req, res, next) => {
    try {
        const matchData = await redisCli.get("data")
        const data = JSON.parse(matchData)

        let cnt = 1
        let analyzedMatchId = []
        let analyzedOption
        for (let i of data) {
            console.log(
                `============================================쳄프 스펠 저장 ${cnt}번============================================`
            )
            const matchId = i.matchData.metadata.matchId
            if (i.matchData.info.gameMode === "CLASSIC" && i.matchData.info.queueId === 420) {
                const participants = i.matchData.info.participants

                // 챔피언 스펠 정보 관련
                for (let v of participants) {
                    const champId = v.championId
                    const champName = v.championName
                    const spell1 = v.summoner1Id
                    const spell2 = v.summoner2Id

                    const spellData = await findSpellInfoData(champId, spell1, spell2)

                    //해당 하는 표본이 없을 경우 생성, 있을 경우 업데이트
                    if (!spellData) {
                        await saveChampSpellInfo(champId, champName, spell1, spell2)
                        analyzedMatchId.push(matchId)
                    } else if (spellData) {
                        await updateChampSpellInfo(champId, spell1, spell2)
                        analyzedMatchId.push(matchId)
                    }
                }
            }
            cnt++
        }
        if (analyzedMatchId.length === 0) {
            return
        } else {
            analyzedOption = {
                set: { spellAnalyzed: true },
            }
            successAnalyzed(analyzedMatchId, analyzedOption)
        }
        return res.status(200).json({ success: true })
    } catch (err) {
        console.log(err)
    }
}

//==========================================================================================================//
//챔프 포지션 카운팅
exports.position = async (req, res, next) => {
    try {
        const matchData = await redisCli.get("data")
        const data = JSON.parse(matchData)

        let analyzedMatchId = []
        let analyzedOption
        let cnt = 1

        for (let i of data) {
            console.log(
                `============================================챔프 포지션 카운팅 ${cnt}번============================================`
            )
            const matchId = i.matchData.metadata.matchId
            if (i.matchData.info.gameMode === "CLASSIC" && i.matchData.info.queueId === 420) {
                const participants = i.matchData.info.participants

                for (let v of participants) {
                    const champId = v.championId

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
                    await addPositionCnt(champId, optionPosition)
                    analyzedMatchId.push(matchId)
                }
            }
            cnt++
        }

        if (analyzedMatchId.length === 0) {
            return
        } else {
            analyzedOption = {
                set: { positionAnalyzed: true },
            }
            await successAnalyzed(analyzedMatchId, analyzedOption)
        }

        return res.status(200).json({ success: true })
    } catch (err) {
        console.log(err)
        return err
    }
}

//==========================================================================================================//
//챔피언 win, lose, ban 카운팅
exports.rate = async (req, res, next) => {
    const matchData = await redisCli.get("data")
    const data = JSON.parse(matchData)
    try {
        let analyzedWinMatchId = []
        let analyzedBanMatchId = []
        let analyzedOption
        let cnt = 1
        for (let i of data) {
            console.log(
                `============================================승/패/밴 카운팅 ${cnt}번============================================`
            )
            const matchId = i.matchData.metadata.matchId
            if (i.matchData.info.gameMode === "CLASSIC" && i.matchData.info.queueId === 420) {
                const participants = i.matchData.info.participants
                //win, lose 카운팅
                for (let v of participants) {
                    const champId = v.championId
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
                    await updateRate(champId, optionWinRate)
                    analyzedWinMatchId.push(matchId)
                }
            }
            //ban 카운팅
            const teams = i.matchData.info.teams
            for (let t of teams) {
                const ban = t.bans
                for (let b of ban) {
                    const champId = b.championId
                    if (b.chmapionId === -1) continue
                    await addBanCnt(champId)
                    analyzedBanMatchId.push(matchId)
                }
            }
            cnt++
        }
        // win, lose , ban 카운팅이 종료되면 analyzed = true
        if (analyzedWinMatchId.length === 0 && analyzedBanMatchId.length === 0) {
            return
        } else {
            analyzedOption = {
                set: { rateAnalyzed: true },
            }
            await successAnalyzed(analyzedWinMatchId, analyzedOption)
            analyzedOption = {
                set: { banAnalyzed: true },
            }
            await successAnalyzed(analyzedBanMatchId, analyzedOption)
        }
        return res.status(200).json({ success: true })
    } catch (err) {
        return err
    }
}

//==========================================================================================================//
//챔피언 id, name 저장
exports.saveChampInfo = async (req, res, next) => {
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
        return res.status(200).json({ success: true })
    } catch (err) {
        console.log(err)
        return err
    }
}
// const redisClient = require("../../redis")
// const redisCli = redisClient.v4

exports.saveRedis = async (req, res, next) => {
    try {
        // const data = await matchDataList()

        // const redisData = JSON.stringify(data)
        // await redisCli.set("data", redisData)
        const data = await redisCli.get("data")
        const matchData = JSON.parse(data)
        console.log(matchData)
        return res.status(200).json({ success: true })
    } catch (err) {
        console.log(err)
        return err
    }
}
