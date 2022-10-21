const {
    findSpellData,
    spellTotalCnt,
    ServicefindSpellInfoData,
    ServiceSaveSpell,
    ServiceUpdateChampSpellInfo,
} = require("../champInfo.service")
const logger = require("../../../log")

//챔프 스펠 정보 연산 후 서비스 DB로 저장
exports.serviceSaveChampSpell = async () => {
    try {
        const spellData = await findSpellData()
        for (let s of spellData) {
            const spell1 = s.champspell_spell1
            const spell2 = s.champspell_spell2
            const champId = s.champspell_champId
            const sampleNum = s.champspell_sampleNum
            const spellTotal = await spellTotalCnt(champId)
            let pickRate = (s.champspell_sampleNum / spellTotal.total) * 100
            pickRate = pickRate.toFixed(2)

            const spellData = await ServicefindSpellInfoData(champId, spell1, spell2)
            if (!spellData) {
                await ServiceSaveSpell(champId, spell1, spell2, pickRate, sampleNum)
            } else if (spellData) {
                await ServiceUpdateChampSpellInfo(champId, spell1, spell2, pickRate, sampleNum)
            }
        }

        return "스펠 데이터 서비스DB 업데이트 완료"
    } catch (err) {
        logger.error(err, { message: "- from serviceSaveChampSpell" })
        return err
    }
}
