const axios = require('axios')
const {
    findVersion_combination_service
} = require("./analyze/data-retirement/data.retirement.service")
const ServiceDB = require('./service.orm')
const { dataSource_service } = require('./service.orm')
const champ_service = dataSource_service.getRepository('CHAMP')
const { validateToolTip } = require('./analyze/champ/champ.skill/skill.controller')
const aws = require('aws-sdk')
const logger = require('./log')
const { checkChamp, saveChampInfoService, updateChampInfoService } = require('./analyze/champ/champ.service/data.save.service')
const { targetChampionSkillInfoSave, targetChampionSkillInfoUpdate } = require('./analyze/champ/champ.skill/skill.service')
const s3 = new aws.S3({ accessKeyId: process.env.ACCESS_ID, secretAccessKey: process.env.SECRET_KEY })
updateNewVersionChampInfo()

// TODO: TASK에 들어가면 uploadChampInfo는 삭제
async function updateNewVersionChampInfo() {
    try {
        await ServiceDB.connectService()
        // 패치 버전 조회하기
        // collect, analyze, transfer 프로세스 시작 전에 버전 체크는 항상 하기
        const { param, version, oldVersion } = await checkVersion()
        // param 0 = riot - DB 패치버전 동일
        // param 1 = riot에 새 패치버전 등장
        // param 2 = DB 패치버전이 riot보다 높음
        if (param === 1) {
            // riot Ddragon에 챔피언 정보 요청 및 업데이트
            await updateNewVersionChampInfoFromRiot(version)
            await deleteOutdatedS3Bucket(oldVersion)
            // TODO: 이전 버전 S3 삭제
        } else if (param === 0) {
            return
        } else {
            // TODO: logger 적용
            console.log('ERROR')
        }
        console.log('end')
    } catch (err) {
        logger.error(err, { message: 'from updateNewVersionChampInfo' })
        process.exit()
    }
}

// TODO: 새 패치버전일 경우, 라이엇에 챔피언 정보 요청
async function updateNewVersionChampInfoFromRiot(version) {
    try {
        // 라이엇에 챔피언 리스트 요청
        const riotResponse = await axios(`https://ddragon.leagueoflegends.com/cdn/${version}.1/data/ko_KR/champion.json`)
        const riotChampList = Object.keys(riotResponse.data.data)
        //  챔피언 리스트별로 챔피언 정보 요청 및 이미지, 스킬 정보 업데이트
        for (let i = 0; i < riotChampList.length; i++) {
            // TODO: CHAMP 이미지 S3 업로드
            const champName = riotChampList[i]
            const originData = await axios(`https://ddragon.leagueoflegends.com/cdn/${version}.1/data/ko_KR/champion/${champName}.json`)
            const champ_name_en = originData.data.data[`${champName}`].id
            const champ_name_ko = originData.data.data[`${champName}`].name
            const champId = originData.data.data[`${champName}`].key

            const champCommonImgKey = originData.data.data[`${champName}`].image.full
            const champMainImgKey = `${champName}_0`

            const { champ_img, champ_main_img } = await uploadChampImgToS3(version, champCommonImgKey, champMainImgKey, champId, champ_name_ko, champ_name_en)

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
                if (skill_id === 'q') qSkillInfo.id = skill_id, qSkillInfo.name = skillName, qSkillInfo.desc = skillDesc, qSkillInfo.tooltip = skillTooltip, qSkillInfo.image = image
                if (skill_id === 'w') wSkillInfo.id = skill_id, wSkillInfo.name = skillName, wSkillInfo.desc = skillDesc, wSkillInfo.tooltip = skillTooltip, wSkillInfo.image = image
                if (skill_id === 'e') eSkillInfo.id = skill_id, eSkillInfo.name = skillName, eSkillInfo.desc = skillDesc, eSkillInfo.tooltip = skillTooltip, eSkillInfo.image = image
                if (skill_id === 'r') rSkillInfo.id = skill_id, rSkillInfo.name = skillName, rSkillInfo.desc = skillDesc, rSkillInfo.tooltip = skillTooltip, rSkillInfo.image = image
            }

            // TODO: 패시브 이미지 S3 업로드
            const passive = originData.data.data[`${champName}`].passive
            const passive_id = 'passive'
            const passiveName = passive.name
            const passiveDesc = validateToolTip(passive.description)
            const image = await uploadPassiveImgToS3(version, passive, champName, passive_id)
            passiveInfo.id = passive_id, passiveInfo.name = passiveName, passiveInfo.desc = passiveDesc, passiveInfo.image = image

            // TODO: 이미지, 스킬 정보 DB에 업데이트 하기
            const existChamp = await checkChamp(champId)
            if (!existChamp) {
                console.log('새로운 데이터입니다.')
                await saveChampInfoService(champId, champ_name_en, champ_name_ko, champ_main_img, champ_img)
                await targetChampionSkillInfoSave(champId, qSkillInfo, wSkillInfo, eSkillInfo, rSkillInfo, passiveInfo)
            } else {
                console.log('이미 있는 데이터입니다')
                await updateChampInfoService(champId, champ_main_img, champ_img)
                await targetChampionSkillInfoUpdate(champId, qSkillInfo, wSkillInfo, eSkillInfo, rSkillInfo, passiveInfo)
            }
        }
    } catch (err) {
        logger.error(err, { message: ` - from getChampInfoFromRiot` })
        return err
    }
}

// TODO: 챔피언 이미지 S3 업로드 로직
async function uploadChampImgToS3(version, champCommonImgKey, champMainImgKey, champId, champ_name_ko, champ_name_en) {
    // 공통, 메인 이미지 get
    try {
        let champ_main_img, champ_img
        const champCommonImgData = await axios({ url: `http://ddragon.leagueoflegends.com/cdn/${version}.1/img/champion/${champCommonImgKey}`, responseType: 'arraybuffer' })
        const champMainImgData = await axios({ url: `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champMainImgKey}.jpg`, responseType: 'arraybuffer' })
        // s3에 common, main 폴더에 각각 넣기
        const champCommonImg = champCommonImgData.data
        const champMainImg = champMainImgData.data
        const commonParams = {
            Bucket: `${process.env.BUCKET}/${version}/champion/common`,
            Key: champCommonImgKey,
            Body: champCommonImg,
            ACL: 'public-read',
            ContentType: 'image/png',
        }
        const mainParams = {
            Bucket: `${process.env.BUCKET}/${version}/champion/main`,
            Key: `${champMainImgKey}.jpg`,
            Body: champMainImg,
            ACL: 'public-read',
            ContentType: 'image/jpeg',
        }

        s3.upload(commonParams, (err, result) => {
            if (err) return err
            console.log(`${champCommonImgKey} 업로드 완료`)
            return
        })
        s3.upload(mainParams, (err, result) => {
            if (err) return err
            console.log(`${champMainImgKey} 업로드 완료`)
        })
        champ_img = `${process.env.S3_ORIGIN_URL}/${version}/champion/common/${champCommonImgKey}`
        champ_main_img = `${process.env.S3_ORIGIN_URL}/${version}/champion/main/${champMainImgKey}.jpg`
        return { champ_img, champ_main_img }
    } catch (err) {
        logger.error(err, { message: ` - from uploadChampImgToS3` })
        return err
    }
}

// TODO: 스킬 이미지 S3 업로드 로직
async function uploadSkillImgToS3(version, skillParam, champName, i) {
    try {
        let image
        let skill_id
        if (i === 0) skill_id = 'q'
        if (i === 1) skill_id = 'w'
        if (i === 2) skill_id = 'e'
        if (i === 3) skill_id = 'r'
        const skillImgData = await axios({ url: `https://ddragon.leagueoflegends.com/cdn/${version}.1/img/spell/${skillParam}.png`, responseType: 'arraybuffer' })
        const skillImg = skillImgData.data
        const params = {
            Bucket: `${process.env.BUCKET}/${version}/skill/spells`,
            Key: `${champName}_${skill_id}.png`,
            Body: skillImg,
            ACL: 'public-read',
            ContentType: 'image/png',
        }
        s3.upload(params, (err, result) => {
            if (err) return err
            console.log(`${champName}_${skill_id} 업로드 완료`)
            return
        })
        image = `${process.env.S3_ORIGIN_URL}/${version}/skill/spells/${champName}_${skill_id}.png`
        return { image, skill_id }
    } catch (err) {
        logger.error(err, { message: ` - from uploadSkillImgToS3` })
        return err
    }
}

// TODO: 패시브 이미지 S3 업로드 로직
async function uploadPassiveImgToS3(version, passive, champName, passive_id) {
    try {
        let image
        const passiveData = await axios({ url: `https://ddragon.leagueoflegends.com/cdn/${version}.1/img/passive/${passive.image.full}`, responseType: 'arraybuffer' })
        const passiveImg = passiveData.data
        // S3로 바로 업로드
        const params = {
            Bucket: `${process.env.BUCKET}/${version}/skill/passive`,
            Key: `${champName}_${passive_id}.png`,
            Body: passiveImg,
            ACL: 'public-read',
            ContentType: 'image/png',
        }
        s3.upload(params, (err, result) => {
            if (err) return err
            console.log(`${champName}_${passive_id}.png 업로드 완료`)
            return
        })
        image = `${process.env.S3_ORIGIN_URL}/${version}/skill/passive/${champName}_${passive_id}.png`
        return image
    } catch (err) {
        logger.error(err, { message: ` - from uploadPassiveImgToS3` })
        return err
    }
}

// TODO: 라이엇 Version과 DB Version 비교
async function checkVersion() {
    let param, version, oldVersion
    const riotVersion = await axios('https://ddragon.leagueoflegends.com/api/versions.json')
    const recentRiotVersion = riotVersion.data[0].slice(0, 5)
    const originData = await findVersion_combination_service()
    const dbVersionList = getRecentDBversion(originData)

    // const dbVersion = dbVersionList[0]
    const dbVersion = '12.22'
    console.log(dbVersion)
    // 패치버전 크기 비교
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
        } else {
            param = 2
        }
    } else {
        param = 2
    }
    return { param, version, oldVersion }
}

// TODO: db 안에 있는 버전 정보 sort 메소드
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

async function deleteOutdatedS3Bucket(oldVersion) {
    const params = {
        Bucket: `${process.env.BUCKET}`,
        Key: `${oldVersion}/`
    }
    s3.deleteObject(params, (err, result) => {
        if (err) return console.log(err)
    })
}