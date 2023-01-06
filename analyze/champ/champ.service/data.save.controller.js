require("dotenv").config()
const axios = require("axios")
const logger = require("../../../log")
const { champSkillSave, fixTooltip } = require("../champ.skill/skill.controller")
const { createNewChampSkillData } = require("../champ.skill/skill.service")
const { dataParsing } = require("../crawling/crawling")
const {
    allRateVersion,
    rateInfo,
    rateDataCheck,
    saveRateDataToService,
    updateRateDataToService,
    allSpellVersion,
    spellInfo,
    saveSpellDataToService,
    checkChamp,
    saveChampInfoService,
    updateChampInfoService,
    champIdList,
    findNewChampId,
    createNewChamp,
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
                const existData = await rateDataCheck(champId, version)
                if (!existData) {
                    console.log("saveRateDataToService create")
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
                } else if (existData) {
                    console.log("saveRateDataToService update")
                    await updateRateDataToService(
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
                await saveSpellDataToService(champId, spell1, spell2, pick_rate, sample_num, version)
            }
        }
    } catch (err) {
        logger.error(err, { message: "- from spellDataToService" })
        return
    }
}

exports.champInfoToService = async () => {
    try {
        //신규 챔피언 추가시 예외처리
        const champIds = await champIdList()
        const champIdResponse = await findNewChampId(champIds)
        const newChampId = []
        for (n in champIdResponse) {
            newChampId.push(...champIdResponse[n])
        }
        const setChampIds = new Set(newChampId.map((v) => Number(v[Object.keys(v)])))
        const result = [...setChampIds]
        if (result.length > 0) {
            const champ_main_img = process.env.DEFAULT_CHAMP_IMG
            const champ_img = process.env.DEFAULT_CHAMP_IMG
            await createNewChamp(result, champ_main_img, champ_img)
            const skill_img = process.env.DEFAULT_SKILL_IMG
            await createNewChampSkillData(result, skill_img)
        }

        //챔피언 정보 DB 생성 및 업데이트
        let champName = []

        const champDataUrl = process.env.CHAMP_DATA_URL
        const champDetailDataUrl = process.env.CHAMP_DETAIL_DATA_URL
        const champImg = process.env.CHAMP_IMG_URL
        const skillImg = process.env.SKILL_IMG
        const passiveImg = process.env.PASSIVE_IMG

        //챔피언 정보 요청
        const response = await axios.get(champDataUrl)

        const champData = response.data.data
        champName.push(...Object.keys(champData))
        for (let i of champName) {
            const champ_name_en = i
            const champId = response.data.data[i].key

            const detailUrl = champDetailDataUrl.replace("Aatrox.json", `${champ_name_en}.json`)
            const detailChamp = await axios.get(detailUrl)

            const champ_name_ko = detailChamp.data.data[champ_name_en].name
            const champ_main_img = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ_name_en}_0.jpg`
            const champ_img = champImg.replace("Aatrox.png", `${champ_name_en}.png`)
            const existChamp = await checkChamp(champId)
            if (!existChamp) {
                await saveChampInfoService(champId, champ_name_en, champ_name_ko, champ_main_img, champ_img)
                await champSkillSave(detailChamp, champId, champ_name_en, skillImg, passiveImg, true)
            } else {
                await updateChampInfoService(champId, champ_img)
                await champSkillSave(detailChamp, champId, champ_name_en, skillImg, passiveImg, false)
            }
        }

        await fixTooltip()
        logger.info(`챔피언 이미지 업데이트 완료`)
        return "champInfoToService 완료"
    } catch (err) {
        logger.error(err, { message: "- from champInfoToService" })
        return
    }
}
