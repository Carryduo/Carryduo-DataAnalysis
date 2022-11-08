const axios = require("axios")
const logger = require("../../../log")
const { champSkillSave, fixTooltip } = require("../champ.skill/skill.controller")
const {
    allRateVersion,
    rateInfo,
    saveRateDataToService,
    allSpellVersion,
    spellInfo,
    saveSpellDataToService,
    checkChamp,
    saveChampInfoService,
    updateChampInfoService,
} = require("./data.save.service")

exports.rateDataToService = async () => {
    try {
        const rateAllVersion = await allRateVersion()

        for (let rAV of rateAllVersion) {
            let allVersion = rAV.version

            if (allVersion === "old") {
                continue
            }
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

                await saveRateDataToService(
                    champId,
                    win_rate,
                    ban_rate,
                    pick_rate,
                    top_rate,
                    jungle_rate,
                    mid_rate,
                    ad_rate,
                    support_rate,
                    version
                )
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

            if (allVersion === "old") {
                continue
            }
            const dataInfos = await spellInfo(allVersion)
            for (let dIs of dataInfos) {
                const champId = dIs.champId
                const spell1 = dIs.spell1
                const spell2 = dIs.spell2
                const pick_rate = dIs.pick_rate
                const sample_num = dIs.sample_num
                const version = dIs.version
                await saveSpellDataToService(
                    champId,
                    spell1,
                    spell2,
                    pick_rate,
                    sample_num,
                    version
                )
            }
        }
    } catch (err) {
        logger.error(err, { message: "- from spellDataToService" })
        return
    }
}

//TODO: 요청 url 최신 버전 적용
exports.champInfoToService = async () => {
    try {
        let champName = []

        const response = await axios.get(
            `http://ddragon.leagueoflegends.com/cdn/12.21.1/data/ko_KR/champion.json`
        )
        const champData = response.data.data
        champName.push(...Object.keys(champData))

        for (let i of champName) {
            const champ_name_en = i
            const champId = response.data.data[i].key
            const detailChamp = await axios.get(
                `https://ddragon.leagueoflegends.com/cdn/12.21.1/data/ko_KR/champion/${champ_name_en}.json`
            )
            const champ_name_ko = detailChamp.data.data[champ_name_en].name
            const champ_main_img = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ_name_en}_0.jpg`
            const champ_img = `https://ddragon.leagueoflegends.com/cdn/12.21.1/img/champion/${champ_name_en}.png`
            const existChamp = await checkChamp(champId)
            if (!existChamp) {
                await saveChampInfoService(
                    champId,
                    champ_name_en,
                    champ_name_ko,
                    champ_main_img,
                    champ_img
                )
                await champSkillSave(detailChamp, champId, champ_name_en, true)
            } else {
                await updateChampInfoService(champId, champ_main_img, champ_img)
                await champSkillSave(detailChamp, champId, champ_name_en, false)
            }
        }
        await fixTooltip()
        console.log("champInfoToService 완료")
        return "champInfoToService 완료"
    } catch (err) {
        console.error(err)
        logger.error(err, { message: "- from champInfoToService" })
        return
    }
}
