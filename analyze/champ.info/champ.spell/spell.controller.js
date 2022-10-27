exports.champSpell = async (data, key) => {
    try {
        let analyzedOption
        let dropAnalyzedOption
        console.log(
            `============================================쳄프 스펠 저장 ${key}번============================================`
        )
        const matchId = data.metadata.matchId
        const participants = data.info.participants

        // 챔피언 스펠 정보 관련
        for (let v of participants) {
            const champId = v.championId
            const champName = v.championName
            const spell1 = v.summoner1Id
            const spell2 = v.summoner2Id

            const spellData = await findSpellInfoData(champId, spell1, spell2)
            // 해당 하는 표본이 없을 경우 생성, 있을 경우 업데이트
            if (!spellData) {
                await saveChampSpellInfo(champId, champName, spell1, spell2)
            } else if (spellData) {
                await updateChampSpellInfo(champId, spell1, spell2)
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
