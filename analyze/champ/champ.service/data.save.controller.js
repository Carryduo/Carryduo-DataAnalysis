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

const {
    findVersion_combination, findVersion_combination_service
} = require('../../data-retirement/data.retirement.service')

const { uploadChampImgToS3, uploadPassiveImgToS3, uploadSkillImgToS3 } = require('./data.save.s3.service')
const { validateToolTip } = require('../champ.skill/skill.controller')
const { targetChampionSkillInfoSave, targetChampionSkillInfoUpdate } = require('../champ.skill/skill.service')
const { LockNotSupportedOnGivenDriverError } = require("typeorm")

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

exports.updateNewChampDefaultImage = async () => {
    try {
        //?????? ????????? ????????? ????????????
        const champIds = await champIdList()
        const champIdResponse = await findNewChampId(champIds)
        const newChampId = []
        for (n in champIdResponse) {
            newChampId.push(...champIdResponse[n])
        }
        const setChampIds = new Set(newChampId.map((v) => Number(v[Object.keys(v)])))
        const result = [...setChampIds]
        if (result.length > 0) {
            logger.info(`????????? ????????? ${result} default ????????? ??????`)
            const champ_main_img = process.env.DEFAULT_CHAMP_IMG
            const champ_img = process.env.DEFAULT_CHAMP_IMG
            await createNewChamp(result, champ_main_img, champ_img)
            const skill_img = process.env.DEFAULT_SKILL_IMG
            await createNewChampSkillData(result, skill_img)
        } else {
            logger.info('????????? ???????????? ????????????')
        }
        return "updateNewChampDefaultImage ??????"
    } catch (err) {
        logger.error(err, { message: "- from updateNewChampDefaultImage" })
        return err
    }
}

// TODO: ???????????? ????????? ???????????? ???????????? DB??? ????????? ???????????? ???????????? ????????????, ?????? ?????? ????????? RETURN
exports.checkVersion = async () => {
    try {
        let param, version, oldVersion
        const riotVersion = await axios('https://ddragon.leagueoflegends.com/api/versions.json')
        const recentRiotVersion = riotVersion.data[0].slice(0, 5)
        const originData = await findVersion_combination_service()
        const dbVersionList = getRecentDBversion(originData)

        // const dbVersion = dbVersionList[0]
        const dbVersion = '12.23'

        // ???????????? ?????? ??????
        const recentRiotVersion_year = Number(recentRiotVersion.split('.')[0])
        const dbVrsion_year = Number(dbVersion.split('.')[0])
        if (recentRiotVersion_year > dbVrsion_year) {
            param = 1
            version = recentRiotVersion
            oldVersion = dbVersion
        } else if (recentRiotVersion_year === dbVrsion_year) {
            const recentRiotVersion_week = Number(recentRiotVersion.split('.')[1])
            const dbVersion_week = Number(dbVersion.split('.')[1])
            if (recentRiotVersion_week > dbVersion_week) {
                param = 1
                version = recentRiotVersion
                oldVersion = dbVersion
            } else if (recentRiotVersion_week === dbVersion_week) {
                param = 0
                version = recentRiotVersion
                oldVersion = dbVersion
            } else {
                param = 2
                version = recentRiotVersion
                oldVersion = dbVersion
            }
        } else {
            param = 2
            version = recentRiotVersion
            oldVersion = dbVersion
        }
        if (version[version.length - 1] === '.') {
            version = version.slice(0, -1)
        }
        if (oldVersion[oldVersion.length - 1] === '.') {
            oldVersion = oldVersion.slice(0, -1)
        }
        return { param, version, oldVersion }
    } catch (err) {
        logger.error(err, { message: '-from checkVersion' })
        return err
    }
}

// DB??? ?????? ???????????? ???????????? ??????????????? ???????????????.
function getRecentDBversion(originData) {
    let data = []
    for (const value of originData) {
        data.push(value.version)
    }

    data = data.filter((version) => {
        if (version[version.length - 1] === ".") {
            version = version.slice(0, -1)
        }
        if (!isNaN(Number(version))) {
            return version
        }
    })
    data = data.sort((a, b) => {
        return b.split(".")[0] - a.split(".")[0]
    })
    let recentVersions = []
    let lastVersions = []
    const recentVersion = Number(String(data[0]).split(".")[0])
    for (let i = 0; i < data.length; i++) {
        const version = data[i]
        if (Number(version.split(".")[0]) < recentVersion) {
            lastVersions.push(version)
        } else {
            recentVersions.push(version)
        }
    }
    recentVersions = recentVersions.sort((a, b) => {
        return String(b).split(".")[1] - String(a).split(".")[1]
    })
    lastVersions = lastVersions.sort((a, b) => {
        return String(b).split(".")[1] - String(a).split(".")[1]
    })
    recentVersions.push(...lastVersions)
    return recentVersions
}

exports.updateNewVersionChampInfoFromRiot = async (version) => {
    try {
        // ???????????? ????????? ????????? ??????
        const riotResponse = await axios(`https://ddragon.leagueoflegends.com/cdn/${version}.1/data/ko_KR/champion.json`)
        const riotChampList = Object.keys(riotResponse.data.data)
        //  ????????? ??????????????? ????????? ?????? ?????? ??? ?????????, ?????? ?????? ????????????
        for (let i = 0; i < riotChampList.length; i++) {
            // TODO: CHAMP ????????? S3 ?????????
            const champName = riotChampList[i]
            const originData = await axios(`https://ddragon.leagueoflegends.com/cdn/${version}.1/data/ko_KR/champion/${champName}.json`)
            const champ_name_en = originData.data.data[`${champName}`].id
            const champ_name_ko = originData.data.data[`${champName}`].name
            const champId = originData.data.data[`${champName}`].key

            const champCommonImgKey = originData.data.data[`${champName}`].image.full
            const champMainImgKey = `${champName}_0`

            const { champ_img, champ_main_img } = await uploadChampImgToS3(version, champCommonImgKey, champMainImgKey, champId, champ_name_ko, champ_name_en)

            // TODO: ?????? ????????? S3 ?????????
            const skillArray = originData.data.data[`${champName}`].spells
            const qSkillInfo = {},
                wSkillInfo = {},
                eSkillInfo = {},
                rSkillInfo = {},
                passiveInfo = {}
            for (let i = 0; i < skillArray.length; i++) {
                const skill = skillArray[i]
                const skillParam = skill.id
                const skillTooltip = validateToolTip(skill.tooltip)
                const skillDesc = validateToolTip(skill.description)
                const skillName = skill.name

                const { image, skill_id } = await uploadSkillImgToS3(version, skillParam, champName, i)
                if (skill_id === 'q') qSkillInfo.id = skill_id, qSkillInfo.name = skillName, qSkillInfo.desc = skillDesc, qSkillInfo.tooltip = skillTooltip, qSkillInfo.image = image
                if (skill_id === 'w') wSkillInfo.id = skill_id, wSkillInfo.name = skillName, wSkillInfo.desc = skillDesc, wSkillInfo.tooltip = skillTooltip, wSkillInfo.image = image
                if (skill_id === 'e') eSkillInfo.id = skill_id, eSkillInfo.name = skillName, eSkillInfo.desc = skillDesc, eSkillInfo.tooltip = skillTooltip, eSkillInfo.image = image
                if (skill_id === 'r') rSkillInfo.id = skill_id, rSkillInfo.name = skillName, rSkillInfo.desc = skillDesc, rSkillInfo.tooltip = skillTooltip, rSkillInfo.image = image
            }

            // TODO: ????????? ????????? S3 ?????????
            const passive = originData.data.data[`${champName}`].passive
            const passive_id = 'passive'
            const passiveName = passive.name
            const passiveDesc = validateToolTip(passive.description)
            const image = await uploadPassiveImgToS3(version, passive, champName, passive_id)
            passiveInfo.id = passive_id, passiveInfo.name = passiveName, passiveInfo.desc = passiveDesc, passiveInfo.image = image

            // TODO: ?????????, ?????? ?????? DB??? ???????????? ??????
            const existChamp = await checkChamp(champId)
            if (!existChamp) {
                console.log('????????? ??????????????????.')
                await saveChampInfoService(champId, champ_name_en, champ_name_ko, champ_main_img, champ_img)
                await targetChampionSkillInfoSave(champId, qSkillInfo, wSkillInfo, eSkillInfo, rSkillInfo, passiveInfo)
            } else {
                console.log('?????? ?????? ??????????????????')
                await updateChampInfoService(champId, champ_main_img, champ_img)
                await targetChampionSkillInfoUpdate(champId, qSkillInfo, wSkillInfo, eSkillInfo, rSkillInfo, passiveInfo)
            }
        }
    } catch (err) {
        logger.error(err, { message: ` - from updateNewVersionChampInfoFromRiot` })
        return err
    }
}