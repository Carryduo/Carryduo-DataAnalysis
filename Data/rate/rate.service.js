const { dataSource } = require("../../orm")
const ChampInfo = dataSource.getRepository("champinfo")
const MatchData = dataSource.getRepository("matchdata")

exports.getMatchDataCnt = async () => {
    return MatchData.createQueryBuilder().getCount()
}

exports.getMatchDataLimit = async () => {
    return MatchData.createQueryBuilder().select(["matchData"]).limit(5).execute()
}

exports.getChampList = async () => {
    return ChampInfo.createQueryBuilder("champ").select(["champId"]).getRawMany()
}

exports.targetChamp = async (champId) => {
    return ChampInfo.createQueryBuilder("champ")
        .where("champId = :champId", { champId })
        .select(["champ.win", "champ.lose", "champ.sampleNum", "champ.banCount"])
        .getOneOrFail()
}

exports.addWinCnt = async (champId) => {
    return ChampInfo.createQueryBuilder()
        .update(ChampInfo)
        .set({ win: () => "win+1", sampleNum: () => "sampleNum+1" })
        .where("champId =:champId", { champId })
        .execute()
}

exports.addLoseCnt = async (champId) => {
    return ChampInfo.createQueryBuilder()
        .update(ChampInfo)
        .set({ lose: () => "lose+1", sampleNum: () => "sampleNum+1" })
        .where("champId =:champId", { champId })
        .execute()
}

exports.addBanCnt = async (champId) => {
    return ChampInfo.createQueryBuilder()
        .update(ChampInfo)
        .set({ banCount: () => "banCount+1" })
        .where("champId =:champId", { champId })
        .execute()
}
