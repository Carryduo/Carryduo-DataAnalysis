const axios = require("axios")
const aws = require("aws-sdk")
const logger = require("../../../log")
require("dotenv").config()
// const s3 = new aws.S3({ accessKeyId: process.env.ACCESS_ID, secretAccessKey: process.env.SECRET_KEY })
aws.config.update({ region: "ap-northeast-2" })
const s3 = new aws.S3({ apiVersion: "2006-03-01" })

exports.uploadChampImgToS3 = async (version, champCommonImgKey, champMainImgKey, champId, champ_name_ko, champ_name_en) => {
    // 공통, 메인 이미지 get
    try {
        let champ_main_img, champ_img
        const champCommonImgData = await axios({
            url: `http://ddragon.leagueoflegends.com/cdn/${version}.1/img/champion/${champCommonImgKey}`,
            responseType: "arraybuffer",
        })
        const champMainImgData = await axios({
            url: `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champMainImgKey}.jpg`,
            responseType: "arraybuffer",
        })
        // s3에 common, main 폴더에 각각 넣기
        const champCommonImg = champCommonImgData.data
        const champMainImg = champMainImgData.data
        const commonParams = {
            Bucket: `${process.env.BUCKET}/${version}/champion/common`,
            Key: champCommonImgKey,
            Body: champCommonImg,
            ACL: "public-read",
            ContentType: "image/png",
        }
        const mainParams = {
            Bucket: `${process.env.BUCKET}/${version}/champion/main`,
            Key: `${champMainImgKey}.jpg`,
            Body: champMainImg,
            ACL: "public-read",
            ContentType: "image/jpeg",
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
exports.uploadSkillImgToS3 = async (version, skillParam, champName, i) => {
    try {
        let image
        let skill_id
        if (i === 0) skill_id = "q"
        if (i === 1) skill_id = "w"
        if (i === 2) skill_id = "e"
        if (i === 3) skill_id = "r"
        const skillImgData = await axios({
            url: `https://ddragon.leagueoflegends.com/cdn/${version}.1/img/spell/${skillParam}.png`,
            responseType: "arraybuffer",
        })
        const skillImg = skillImgData.data
        const params = {
            Bucket: `${process.env.BUCKET}/${version}/skill/spells`,
            Key: `${champName}_${skill_id}.png`,
            Body: skillImg,
            ACL: "public-read",
            ContentType: "image/png",
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
exports.uploadPassiveImgToS3 = async (version, passive, champName, passive_id) => {
    try {
        let image
        const passiveData = await axios({
            url: `https://ddragon.leagueoflegends.com/cdn/${version}.1/img/passive/${passive.image.full}`,
            responseType: "arraybuffer",
        })
        const passiveImg = passiveData.data
        // S3로 바로 업로드
        const params = {
            Bucket: `${process.env.BUCKET}/${version}/skill/passive`,
            Key: `${champName}_${passive_id}.png`,
            Body: passiveImg,
            ACL: "public-read",
            ContentType: "image/png",
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

// S3에서 이전 패치버전 폴더는 삭제합니다.
exports.deleteOutdatedS3Bucket = async (oldVersion) => {
    try {
        const data = await getObjectsFromS3Bucket(oldVersion)

        for (let i = 0; i < data.Contents.length; i++) {
            const params = {
                Bucket: `${process.env.BUCKET}`,
                Key: data.Contents[i].Key,
            }
            s3.deleteObject(params, (err, result) => {
                if (err) return err
            })
        }

        const status = await getObjectsFromS3Bucket(oldVersion)

        if (status.Contents.length !== 0) {
            logger.info(`${oldVersion} 폴더 삭제를 재실행합니다`)
            await this.deleteOutdatedS3Bucket(oldVersion)
        } else {
            return
        }
    } catch (err) {
        logger.error(err, { message: "- from deleteOutdatedS3Bucket" })
        return err
    }
}

async function getObjectsFromS3Bucket(oldVersion) {
    return await s3.listObjectsV2({ Bucket: `${process.env.BUCKET}`, Prefix: `${oldVersion}/` }).promise()
}
