const { findSpellInfoData, saveChampSpellInfo, updateChampSpellInfo } = require("./spell.service")
const { successAnalyzed } = require("../champInfo.service")
const logger = require("../../../log")

exports.spell = async (data, key) => {
    try {
        let analyzedOption
        console.log(
            `============================================쳄프 스펠 저장 ${key}번============================================`
        )
        const matchId = data.metadata.matchId
        const participants = data.info.participants
        const version = data.info.gameVersion.substring(0, 5)

        // 챔피언 스펠 정보 관련
        for (let v of participants) {
            const champId = v.championId
            const spell1 = v.summoner1Id
            const spell2 = v.summoner2Id

            const spellDataCheck = await findSpellInfoData(champId, spell1, spell2, version)

            if (!spellDataCheck) {
                await saveChampSpellInfo(champId, spell1, spell2, version)
            } else if (spellDataCheck) {
                await updateChampSpellInfo(champId, spell1, spell2, version)
            }
        }
        analyzedOption = {
            set: { spellAnalyzed: 1 },
        }
        // await successAnalyzed(matchId, analyzedOption)
    } catch (err) {
        logger.error(err, { message: "- from champSpell" })
        return
    }
}
