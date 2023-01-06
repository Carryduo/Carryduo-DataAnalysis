const {
    targetChampionSkillInfoSave,
    targetChampionSkillInfoUpdate,
    getTooltip,
    editToolTip,
} = require("./skill.service")
const logger = require("../../../log")

//챔피언 정보 및 스킬정보 서비스DB 저장 로직
exports.champSkillSave = async (detailChamp, champId, key, skillImg, passiveImg, status) => {
    try {
        const spells = detailChamp.data.data[key].spells
        const passive = detailChamp.data.data[key].passive

        const qSkill = {
            id: "q",
            name: spells[0].name,
            desc: spells[0].description,
            tooltip: spells[0].tooltip,
            image: skillImg.replace("FlashFrost.png", `${spells[0].image.full}`),
        }
        const wSkill = {
            id: "w",
            name: spells[1].name,
            desc: spells[1].description,
            tooltip: spells[1].tooltip,
            image: skillImg.replace("FlashFrost.png", `${spells[1].image.full}`),
        }
        const eSkill = {
            id: "e",
            name: spells[2].name,
            desc: spells[2].description,
            tooltip: spells[2].tooltip,
            image: skillImg.replace("FlashFrost.png", `${spells[2].image.full}`),
        }
        const rSkill = {
            id: "r",
            name: spells[3].name,
            desc: spells[3].description,
            tooltip: spells[3].tooltip,
            image: skillImg.replace("FlashFrost.png", `${spells[3].image.full}`),
        }
        const passiveSkill = {
            id: "passive",
            name: passive.name,
            desc: passive.description,
            image: passiveImg.replace("Anivia_P.png", `${passive.image.full}`),
        }
        if (status) {
            await targetChampionSkillInfoSave(champId, qSkill, wSkill, eSkill, rSkill, passiveSkill)
        } else if (!status) {
            await targetChampionSkillInfoUpdate(
                champId,
                qSkill,
                wSkill,
                eSkill,
                rSkill,
                passiveSkill
            )
        }
    } catch (err) {
        logger.error(err, { message: "- from champSkillSave" })
    }
}

exports.fixTooltip = async () => {
    try {
        const dataList = await getTooltip()
        for (let i = 0; i < dataList.length; i++) {
            let skill_desc
            let skill_tool_tip
            const champId = dataList[i].champId
            const skill_id = dataList[i].skill_id

            if (dataList[i].skill_desc) {
                skill_desc = validateToolTip(dataList[i].skill_desc)
            }
            if (dataList[i].skill_tool_tip) {
                skill_tool_tip = validateToolTip(dataList[i].skill_tool_tip)
            }

            await editToolTip(skill_id, champId, skill_tool_tip, skill_desc)
        }
    } catch (err) {
        logger.error(err, { message: "- from fixTooltip" })
    }
}

exports.validateToolTip = (value) => {
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
