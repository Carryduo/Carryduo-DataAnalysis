const { getChampList, getMatchIdCnt, ServiceSaveRate } = require("../champInfo.service")
const logger = require("../../../log")
// 챔프 승/ 픽/ 벤 연산 후 서비스 DB로 저장
exports.serviceSaveRate = async () => {
    try {
        const champList = await getChampList()
        const totalCnt = await getMatchIdCnt()
        for (let c of champList) {
            const champId = c.champ_champId

            //챔피언 승, 픽, 밴 연산
            let winRate = (c.champ_win / c.champ_sampleNum) * 100
            winRate = winRate.toFixed(2)

            let pickRate = (c.champ_sampleNum / totalCnt) * 100
            pickRate = pickRate.toFixed(2)

            let banRate = (c.champ_banCount / totalCnt) * 100
            banRate = banRate.toFixed(2)
            await ServiceSaveRate(champId, winRate, pickRate, banRate)
        }
        return "승/패/벤 데이터 서비스DB 업데이트 완료"
    } catch (err) {
        logger.error(err, { message: "- from serviceSaveRate" })

        return err
    }
}
