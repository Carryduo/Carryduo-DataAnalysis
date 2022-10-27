const {
    getRateVersion,
    createRate,
    updateRate,
    allWinRateVersion,
    rateInfo,
    saveWinPickRate,
} = require("./rate.service")

const { successAnalyzed } = require("../champInfo.service")

const logger = require("../../../log")

exports.rate = async (data, key) => {
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
        logger.error(err, { message: "- from rate" })
        return
    }
}

exports.saveWinRate = async () => {
    try {
        let dupWinRateVersion = []
        const WinRateAllVersion = await allWinRateVersion()

        for (let WRAV of WinRateAllVersion) {
            dupWinRateVersion.push(WRAV.version)
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
