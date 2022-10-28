const {
    getRateVersion,
    createRate,
    updateRate,
    allWinRateVersion,
    rateInfo,
    saveWinPickRate,
    createBanCnt,
    updateBanCnt,
    deleteBanOldVersion,
    getBanVersion,
    allBanVersion,
    banInfo,
    saveBanRate,
} = require("./rate.service")

const { successAnalyzed } = require("../champInfo.service")

const logger = require("../../../log")

/**
 * win rate
 * win rate save
 */

exports.winRate = async (data, key) => {
    try {
        let analyzedOption
        console.log(
            `============================================승/패/ 카운팅 ${key}번============================================`
        )
        const matchId = data.metadata.matchId

        const participants = data.info.participants
        const version = data.info.gameVersion.substring(0, 5)

        for (let v of participants) {
            let updateOptionWinRate
            let win

            if (v.win) {
                win = true
                updateOptionWinRate = {
                    set: { win: () => "win+1", sampleNum: () => "sampleNum+1" },
                }
            } else {
                win = false
                updateOptionWinRate = {
                    set: { lose: () => "lose+1", sampleNum: () => "sampleNum+1" },
                }
            }

            const champId = v.championId
            const findVersion = await getRateVersion(champId, version)

            if (!findVersion) {
                await createRate(champId, version, win)
            } else if (findVersion) {
                await updateRate(champId, version, updateOptionWinRate)
            }
        }
        // 카운팅 후 카운팅한 matchId 상태값 변경
        analyzedOption = {
            set: { rateAnalyzed: 1 },
        }
        await successAnalyzed(matchId, analyzedOption)
    } catch (err) {
        logger.error(err, { message: "- from winRate" })
        return
    }
}

exports.winPickRateSave = async () => {
    try {
        let dupWinRateVersion = []
        const winRateAllVersion = await allWinRateVersion()

        for (let wAV of winRateAllVersion) {
            dupWinRateVersion.push(wAV.version)
        }

        const set = new Set(dupWinRateVersion)
        const uniqWinRateVersion = [...set]

        for (let uv of uniqWinRateVersion) {
            if (uv === "old") {
                continue
            }
            const rateInfos = await rateInfo(uv)
            for (let rIs of rateInfos) {
                const champId = rIs.champId
                const sampleNum = rIs.sampleNum
                const version = rIs.version
                const win = rIs.win
                const totalCnt = rateInfos.length

                let winRate = (win / sampleNum) * 100
                winRate = Number(winRate.toFixed(2))

                let pickRate = (sampleNum / totalCnt) * 100
                pickRate = Number(pickRate.toFixed(2))

                await saveWinPickRate(champId, winRate, pickRate, version)
            }
        }
        return "승/픽률 데이터 서비스 table 업데이트 완료"
    } catch (err) {
        logger.error(err, { message: "- from saveWinPickRate" })

        return err
    }
}

/**
 * ban rate
 * ban rate save
 * pick rate save
 */

exports.banRate = async (data, key) => {
    try {
        console.log(
            `=============================================밴 카운팅 ${key}번============================================`
        )
        const matchId = data.metadata.matchId
        const version = data.info.gameVersion.substring(0, 5)
        let champList = []

        const teams = data.info.teams
        for (let t of teams) {
            const ban = t.bans

            for (let b of ban) {
                const champId = b.championId

                if (champId === -1) {
                    console.log(champId)
                    continue
                }
                champList.push(champId)
            }
        }

        const setChampList = new Set(champList)
        const newChampLIst = [...setChampList]

        let option
        let banCount

        for (let nCL of newChampLIst) {
            const versionCheck = await getBanVersion(nCL, version)
            if (!versionCheck) {
                // create
                if (champList.indexOf(nCL) === champList.lastIndexOf(nCL)) {
                    banCount = 1
                    await createBanCnt(nCL, banCount, version)
                } else if (champList.indexOf(nCL) !== champList.lastIndexOf(nCL)) {
                    banCount = 2
                    await createBanCnt(nCL, banCount, version)
                }
            } else if (versionCheck) {
                //update
                if (champList.indexOf(nCL) === champList.lastIndexOf(nCL)) {
                    option = {
                        set: { banCount: () => "banCount+1", sampleNum: () => "sampleNum+1" },
                    }
                    await updateBanCnt(nCL, option, version)
                } else if (champList.indexOf(nCL) !== champList.lastIndexOf(nCL)) {
                    option = {
                        set: { banCount: () => "banCount+2", sampleNum: () => "sampleNum+1" },
                    }
                    await updateBanCnt(nCL, option, version)
                }
            }
        }
        await deleteBanOldVersion()
        analyzedOption = {
            set: { banAnalyzed: 1 },
        }
        await successAnalyzed(matchId, analyzedOption)
    } catch (err) {
        logger.error(err, { message: "- from banRate" })
        return
    }
}

exports.banRateSave = async () => {
    try {
        let dupBanVersion = []
        const banAllVersion = await allBanVersion()

        for (let bI of banAllVersion) {
            dupBanVersion.push(bI.version)
        }

        const set = new Set(dupBanVersion)
        const uniqBanVersion = [...set]

        for (let bV of uniqBanVersion) {
            if (bV === "old") {
                continue
            }
            const banInfos = await banInfo(bV)
            for (let bIs of banInfos) {
                const champId = bIs.champId
                const sampleNum = bIs.sampleNum
                const version = bIs.version
                const banCount = bIs.banCount

                let banRate = (banCount / sampleNum) * 100
                banRate = Number(banRate.toFixed(2))
                await saveBanRate(champId, banRate, version)
            }
        }
        return "벤 데이터 서비스 table 업데이트 완료"
    } catch (err) {
        logger.error(err, { message: "- from saveBanRate" })

        return err
    }
}
