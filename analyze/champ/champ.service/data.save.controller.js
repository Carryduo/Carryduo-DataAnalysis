require("dotenv").config()
const axios = require("axios")
const logger = require("../../../log")
const { champSkillSave, fixTooltip } = require("../champ.skill/skill.controller")
const { createNewChampSkillData } = require("../champ.skill/skill.service")
const {
    checkChamp,
    saveChampInfoService,
    updateChampInfoService,
    champIdList,
    findNewChampId,
    createNewChamp,
} = require("./data.save.service")

const {
    findVersion_combination,
    findVersion_combination_service,
} = require("../../data-retirement/data.retirement.service")

const { uploadChampImgToS3, uploadPassiveImgToS3, uploadSkillImgToS3 } = require("./data.save.s3.service")
const { validateToolTip } = require("../champ.skill/skill.controller")
const { targetChampionSkillInfoSave, targetChampionSkillInfoUpdate } = require("../champ.skill/skill.service")

exports.updateNewChampDefaultImage = async () => {
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
            logger.info(`새로운 챔피언 ${result} default 이미지 삽입`)
            const champ_main_img = process.env.DEFAULT_CHAMP_IMG
            const champ_img = process.env.DEFAULT_CHAMP_IMG
            await createNewChamp(result, champ_main_img, champ_img)
            const skill_img = process.env.DEFAULT_SKILL_IMG
            await createNewChampSkillData(result, skill_img)
        } else {
            logger.info("새로운 챔피언은 없습니다")
        }
        return "updateNewChampDefaultImage 완료"
    } catch (err) {
        logger.error(err, { message: "- from updateNewChampDefaultImage" })
        return err
    }
}

// TODO: 라이엇이 제공한 패치버전 리스트와 DB에 저장된 패치버전 리스트를 비교하여, 최신 패치 버전을 RETURN
exports.checkVersion = async () => {
    try {
        let param, version, oldVersion
        const riotVersion = await axios("https://ddragon.leagueoflegends.com/api/versions.json")
        const recentRiotVersion = riotVersion.data[0].slice(0, 5)
        const originData = await findVersion_combination_service()
        const dbVersionList = getRecentDBversion(originData)

        const dbVersion = dbVersionList[0]

        // 패치버전 크기 비교
        const recentRiotVersion_year = Number(recentRiotVersion.split(".")[0])
        const dbVrsion_year = Number(dbVersion.split(".")[0])
        if (recentRiotVersion_year > dbVrsion_year) {
            param = 1
            version = recentRiotVersion
            oldVersion = dbVersion
        } else if (recentRiotVersion_year === dbVrsion_year) {
            const recentRiotVersion_week = Number(recentRiotVersion.split(".")[1])
            const dbVersion_week = Number(dbVersion.split(".")[1])
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
        if (version[version.length - 1] === ".") {
            version = version.slice(0, -1)
        }
        if (oldVersion[oldVersion.length - 1] === ".") {
            oldVersion = oldVersion.slice(0, -1)
        }
        return { param, version, oldVersion }
    } catch (err) {
        logger.error(err, { message: "-from checkVersion" })
        return err
    }
}

// DB에 있는 패치버전 리스트를 최신순으로 정렬합니다.
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
        // 라이엇에 챔피언 리스트 요청
        const riotResponse = await axios(
            `https://ddragon.leagueoflegends.com/cdn/${version}.1/data/ko_KR/champion.json`
        )
        const riotChampList = Object.keys(riotResponse.data.data)
        //  챔피언 리스트별로 챔피언 정보 요청 및 이미지, 스킬 정보 업데이트
        for (let i = 0; i < riotChampList.length; i++) {
            // TODO: CHAMP 이미지 S3 업로드
            const champName = riotChampList[i]
            const originData = await axios(
                `https://ddragon.leagueoflegends.com/cdn/${version}.1/data/ko_KR/champion/${champName}.json`
            )
            const champ_name_en = originData.data.data[`${champName}`].id
            const champ_name_ko = originData.data.data[`${champName}`].name
            const champId = originData.data.data[`${champName}`].key

            const champCommonImgKey = originData.data.data[`${champName}`].image.full
            const champMainImgKey = `${champName}_0`

            const { champ_img, champ_main_img } = await uploadChampImgToS3(
                version,
                champCommonImgKey,
                champMainImgKey,
                champId,
                champ_name_ko,
                champ_name_en
            )

            // TODO: 스킬 이미지 S3 업로드
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
                if (skill_id === "q")
                    (qSkillInfo.id = skill_id),
                        (qSkillInfo.name = skillName),
                        (qSkillInfo.desc = skillDesc),
                        (qSkillInfo.tooltip = skillTooltip),
                        (qSkillInfo.image = image)
                if (skill_id === "w")
                    (wSkillInfo.id = skill_id),
                        (wSkillInfo.name = skillName),
                        (wSkillInfo.desc = skillDesc),
                        (wSkillInfo.tooltip = skillTooltip),
                        (wSkillInfo.image = image)
                if (skill_id === "e")
                    (eSkillInfo.id = skill_id),
                        (eSkillInfo.name = skillName),
                        (eSkillInfo.desc = skillDesc),
                        (eSkillInfo.tooltip = skillTooltip),
                        (eSkillInfo.image = image)
                if (skill_id === "r")
                    (rSkillInfo.id = skill_id),
                        (rSkillInfo.name = skillName),
                        (rSkillInfo.desc = skillDesc),
                        (rSkillInfo.tooltip = skillTooltip),
                        (rSkillInfo.image = image)
            }

            // TODO: 패시브 이미지 S3 업로드
            const passive = originData.data.data[`${champName}`].passive
            const passive_id = "passive"
            const passiveName = passive.name
            const passiveDesc = validateToolTip(passive.description)
            const image = await uploadPassiveImgToS3(version, passive, champName, passive_id)
            ;(passiveInfo.id = passive_id),
                (passiveInfo.name = passiveName),
                (passiveInfo.desc = passiveDesc),
                (passiveInfo.image = image)

            // TODO: 이미지, 스킬 정보 DB에 업데이트 하기
            const existChamp = await checkChamp(champId)
            if (!existChamp) {
                console.log("새로운 데이터입니다.")
                await saveChampInfoService(champId, champ_name_en, champ_name_ko, champ_main_img, champ_img)
                await targetChampionSkillInfoSave(champId, qSkillInfo, wSkillInfo, eSkillInfo, rSkillInfo, passiveInfo)
            } else {
                console.log("이미 있는 데이터입니다")
                await updateChampInfoService(champId, champ_main_img, champ_img)
                await targetChampionSkillInfoUpdate(
                    champId,
                    qSkillInfo,
                    wSkillInfo,
                    eSkillInfo,
                    rSkillInfo,
                    passiveInfo
                )
            }
        }
    } catch (err) {
        logger.error(err, { message: ` - from updateNewVersionChampInfoFromRiot` })
        return err
    }
}
