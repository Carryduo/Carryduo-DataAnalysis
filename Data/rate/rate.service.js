const { dataSource } = require("../../orm")
const ChampInfo = dataSource.getRepository("champinfo")
const MatchData = dataSource.getRepository("matchdata")

const { dataSource_service } = require("../../orm")
const Champ = dataSource_service.getRepository("CHAMP")

exports.saveChampId = async (champName, champId) => {
    return ChampInfo.createQueryBuilder()
        .insert()
        .values({
            champName,
            champId,
        })
        .execute()
        .then((value) => {
            return { code: 200, message: "정상" }
        })
        .catch((error) => {
            console.log(error.errno)
            if (error.errno === 1062) {
                return { code: 1062, message: "중복값 에러" }
            }
        })
}

exports.champCnt = async () => {
    return ChampInfo.createQueryBuilder("champ").getCount()
}

exports.getMatchDataCnt = async () => {
    return MatchData.createQueryBuilder().getCount()
}

exports.getMatchDataLimit = async () => {
    return MatchData.createQueryBuilder().select(["matchData"]).limit(5).execute()
}

exports.getChampList = async () => {
    return ChampInfo.createQueryBuilder("champ").getRawMany()
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
        .where("champId = :champId", { champId })
        .execute()
}

exports.addLoseCnt = async (champId) => {
    return ChampInfo.createQueryBuilder()
        .update(ChampInfo)
        .set({ lose: () => "lose+1", sampleNum: () => "sampleNum+1" })
        .where("champId = :champId", { champId })
        .execute()
}

exports.addBanCnt = async (champId) => {
    return ChampInfo.createQueryBuilder()
        .update(ChampInfo)
        .set({ banCount: () => "banCount+1" })
        .where("champId = :champId", { champId })
        .execute()
}

exports.ServiceSaveRate = async (champId, winRate, pickRate, banRate) => {
    return Champ.createQueryBuilder()
        .update(Champ)
        .set({ win_rate: winRate, pick_rate: pickRate, ban_rate: banRate })
        .where("champId = :champId", { champId })
        .execute()
}
