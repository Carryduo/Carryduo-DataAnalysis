const { dataSource_service } = require("../../../service.orm")
const ChampService = dataSource_service.getRepository("CHAMP")
const ChampSkill = dataSource_service.getRepository("CHAMPSKILL")

exports.targetChampionInfoSave = async (data) => {
    return ChampService.createQueryBuilder()
        .insert()
        .values({
            id: data.championId,
            champNameEn: data.championNameEn,
            champNameKo: data.championNameKo,
            champMainImg: data.championMainImg,
            champImg: data.championImg,
        })
        .execute()
}

exports.targetChampionSkillInfoSave = async (
    championId,
    qSkillInfo,
    wSkillInfo,
    eSkillInfo,
    rSkillInfo,
    passiveInfo
) => {
    await ChampSkill.createQueryBuilder()
        .insert()
        .values({
            champId: championId,
            skillId: qSkillInfo.id,
            skillName: qSkillInfo.name,
            skillDesc: qSkillInfo.desc,
            skillToolTip: qSkillInfo.tooltip,
            skillImg: qSkillInfo.image,
        })
        .execute()

    await ChampSkill.createQueryBuilder()
        .insert()
        .values({
            champId: championId,
            skillId: wSkillInfo.id,
            skillName: wSkillInfo.name,
            skillDesc: wSkillInfo.desc,
            skillToolTip: wSkillInfo.tooltip,
            skillImg: wSkillInfo.image,
        })
        .execute()

    await ChampSkill.createQueryBuilder()
        .insert()
        .values({
            champId: championId,
            skillId: eSkillInfo.id,
            skillName: eSkillInfo.name,
            skillDesc: eSkillInfo.desc,
            skillToolTip: eSkillInfo.tooltip,
            skillImg: eSkillInfo.image,
        })
        .execute()

    await ChampSkill.createQueryBuilder()
        .insert()
        .values({
            champId: championId,
            skillId: rSkillInfo.id,
            skillName: rSkillInfo.name,
            skillDesc: rSkillInfo.desc,
            skillToolTip: rSkillInfo.tooltip,
            skillImg: rSkillInfo.image,
        })
        .execute()

    await ChampSkill.createQueryBuilder()
        .insert()
        .values({
            champId: championId,
            skillId: passiveInfo.id,
            skillName: passiveInfo.name,
            skillDesc: passiveInfo.desc,
            skillImg: passiveInfo.image,
        })
        .execute()
}

exports.getTooltip = async () => {
    return await ChampSkill.createQueryBuilder().select().getMany()
}

exports.editToolTip = async (champId, skillToolTip, skillDesc) => {
    try {
        await ChampSkill.createQueryBuilder()
            .update()
            .set({ skillToolTip, skillDesc })
            .where("champId = :champId", { champId })
            .execute()
    } catch (error) {
        console.log(error)
        return "fail"
    }
}
