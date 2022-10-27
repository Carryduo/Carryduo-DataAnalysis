const { getRateVersion, createRate, updateRate, deleteRateOldVersion } = require("./rate.service")
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
        await deleteRateOldVersion()

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
