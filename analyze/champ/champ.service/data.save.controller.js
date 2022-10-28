const logger = require("../../../log")
const {
    allRateVersion,
    rateInfo,
    saveRateDataToService,
    allSpellVersion,
    spellInfo,
    saveSpellDataToService,
} = require("./data.save.service")

exports.rateDataToService = async () => {
    try {
        const rateAllVersion = await allRateVersion()

        for (let rAV of rateAllVersion) {
            let allVersion = rAV.version
            const dataInfos = await rateInfo(allVersion)
            for (let dIs of dataInfos) {
                const champId = dIs.champId
                const win_rate = dIs.win_rate
                const ban_rate = dIs.ban_rate
                const pick_rate = dIs.pick_rate
                const top_rate = dIs.top_rate
                const jungle_rate = dIs.jungle_rate
                const mid_rate = dIs.mid_rate
                const ad_rate = dIs.ad_rate
                const support_rate = dIs.support_rate
                const version = dIs.version

                // await saveRateDataToService(
                //     champId,
                //     win_rate,
                //     ban_rate,
                //     pick_rate,
                //     top_rate,
                //     jungle_rate,
                //     mid_rate,
                //     ad_rate,
                //     support_rate,
                //     version
                // )
            }
        }
    } catch (err) {
        logger.error(err, { message: "- from rateDataToService" })
        return
    }
}

exports.spellDataToService = async () => {
    try {
        const spellAllVersion = await allSpellVersion()

        for (let sAV of spellAllVersion) {
            let allVersion = sAV.version
            const dataInfos = await spellInfo(allVersion)
            for (let dIs of dataInfos) {
                const champId = dIs.champId
                const spell1 = dIs.spell1
                const spell2 = dIs.spell2
                const pick_rate = dIs.pick_rate
                const sample_num = dIs.sample_num
                const version = dIs.version
                // await saveSpellDataToService(champId, spell1, spell2, pick_rate, sample_num, version)
            }
        }
    } catch (err) {
        logger.error(err, { message: "- from spellDataToService" })
        return
    }
}

exports.champInfoToService = async () => {}
