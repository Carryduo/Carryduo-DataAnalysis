const {
    findSpellInfo,
    saveChampSpellInfo,
    updateChampSpellInfo,
    allSpellVersion,
    findSpellData,
    spellTotalCnt,
    findSpellInfoData,
    saveSpellData,
    updateChampSpellData,
} = require("./spell.service")
const { successAnalyzed } = require("../champ.common.service")
const logger = require("../../../log")

exports.spell = async (data) => {
    try {
        let analyzedOption

        const matchId = data.metadata.matchId
        const participants = data.info.participants
        const version = data.info.gameVersion.substring(0, 5)

        // 챔피언 스펠 정보 관련
        for (let v of participants) {
            const champId = v.championId
            const spell1 = v.summoner1Id
            const spell2 = v.summoner2Id
            const position = v.teamPosition

            const spellDataCheck = await findSpellInfo(champId, spell1, spell2, version, position)

            if (!spellDataCheck) {
                await saveChampSpellInfo(champId, spell1, spell2, version, position)
            } else if (spellDataCheck) {
                await updateChampSpellInfo(champId, spell1, spell2, version, position)
            }
        }
        analyzedOption = {
            set: { spellAnalyzed: 1 },
        }
        await successAnalyzed(matchId, analyzedOption)
    } catch (err) {
        logger.error(err, { message: "- from champSpell" })
        return
    }
}

exports.spellCaculation = async () => {
    try {
        const spellAllVersion = await allSpellVersion()

        for (let sAV of spellAllVersion) {
            const version = sAV.version

            if (version === "old") {
                continue
            }
            const spellData = await findSpellData(version)
            for (let s of spellData) {
                const spell1 = s.spell1
                const spell2 = s.spell2
                const champId = s.champId
                const sampleNum = s.sampleNum
                const position = s.position
                const spellTotal = await spellTotalCnt(champId, version, position)

                let pickRate = (sampleNum / spellTotal.total) * 100
                pickRate = Number(pickRate.toFixed(2))
                const spellData = await findSpellInfoData(champId, spell1, spell2, version, position)
                if (!spellData) {
                    await saveSpellData(champId, spell1, spell2, pickRate, sampleNum, version, position)
                } else if (spellData) {
                    await updateChampSpellData(champId, spell1, spell2, pickRate, sampleNum, version, position)
                }
            }
        }
    } catch (err) {
        logger.error(err, { message: "- from spellSave" })
        return
    }
}
