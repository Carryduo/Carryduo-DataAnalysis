const {
    targetChampionInfoSave,
    targetChampionSkillInfoSave,
    getTooltip,
    editToolTip,
} = require("./skill.service")
const axios = require("axios")
const logger = require("../../../log")

//챔피언 정보 및 스킬정보 서비스DB 저장 로직
exports.riotChampData = async () => {
    try {
        const champRequest = await axios.get(
            `https://ddragon.leagueoflegends.com/cdn/12.17.1/data/ko_KR/champion.json`
        )
        const champList = champRequest.data.data

        const champName = Object.keys(champList)
        for (const key in champName) {
            const value = champName[key]
            const targetChampionResult = await axios.get(
                `https://ddragon.leagueoflegends.com/cdn/12.17.1/data/ko_KR/champion/${value}.json`
            )
            const targetChampionInfo = targetChampionResult.data.data

            const championId = targetChampionInfo[value].key
            const championNameEn = targetChampionInfo[value].id
            const championNameKo = targetChampionInfo[value].name
            const championMainImg = `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championNameEn}_0.jpg`
            const championImg = `https://ddragon.leagueoflegends.com/cdn/12.18.1/img/champion/${championNameEn}.png`

            const data = {
                championId,
                championNameEn,
                championNameKo,
                championMainImg,
                championImg,
            }
            await targetChampionInfoSave(data)

            const { spells } = targetChampionInfo[value]
            const { passive } = targetChampionInfo[value]

            const qSkill = {
                id: "q",
                name: spells[0].name,
                desc: spells[0].description,
                tooltip: spells[0].tooltip,
                image: `https://ddragon.leagueoflegends.com/cdn/12.17.1/img/spell/${spells[0].image.full}`,
            }
            const wSkill = {
                id: "w",
                name: spells[1].name,
                desc: spells[1].description,
                tooltip: spells[1].tooltip,
                image: `https://ddragon.leagueoflegends.com/cdn/12.17.1/img/spell/${spells[1].image.full}`,
            }
            const eSkill = {
                id: "e",
                name: spells[2].name,
                desc: spells[2].description,
                tooltip: spells[2].tooltip,
                image: `https://ddragon.leagueoflegends.com/cdn/12.17.1/img/spell/${spells[2].image.full}`,
            }
            const rSkill = {
                id: "r",
                name: spells[3].name,
                desc: spells[3].description,
                tooltip: spells[3].tooltip,
                image: `https://ddragon.leagueoflegends.com/cdn/12.17.1/img/spell/${spells[3].image.full}`,
            }

            const passiveSkill = {
                id: "passive",
                name: passive.name,
                desc: passive.description,
                image: `http://ddragon.leagueoflegends.com/cdn/12.17.1/img/passive/${passive.image.full}`,
            }

            await targetChampionSkillInfoSave(
                championId,
                qSkill,
                wSkill,
                eSkill,
                rSkill,
                passiveSkill
            )

            await this.fixTooltip()
        }
    } catch (err) {
        logger.error(err, { message: "- from riotChampData" })
    }
}

exports.fixTooltip = async () => {
    const dataList = await getTooltip()
    for (let i = 0; i < dataList.length; i++) {
        if (dataList[i].skillDesc) {
            dataList[i].skillDesc = validateToolTip(dataList[i].skillDesc)
        }
        if (dataList[i].skillToolTip) {
            dataList[i].skillToolTip = validateToolTip(dataList[i].skillToolTip)
        }
        await editToolTip(dataList[i].champId, dataList[i].skillToolTip, dataList[i].skillDesc)
    }

    return { succes: true }
}

function validateToolTip(value) {
    const data = value.split("")
    const checkUnique = /[<>/:*#'="-]/
    const checkEng = /[a-zA-Z]/
    const checkNum = /[0-9]/
    const result = []

    for (let i = 0; i < data.length; i++) {
        if (!checkUnique.test(data[i])) {
            if (!checkEng.test(data[i])) {
                if (checkNum.test(data[i])) {
                    data[i] = ""
                }
                result.push(data[i])
            }
        }
    }
    let secondData = result.join("")

    while (secondData.includes("{{") && secondData.includes("}}")) {
        replace(secondData)
    }
    function replace(value) {
        secondData = value
            .replace("{{", "!")
            .replace("}}", "?")
            .replace("!  ?", "?")
            .replace("!", "")
            .replace(".?", ".")
        return
    }
    return secondData
}
