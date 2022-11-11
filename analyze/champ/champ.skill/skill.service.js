const { dataSource_service } = require("../../../service.orm")
const ChampSkill = dataSource_service.getRepository("CHAMPSKILLINFO")

const logger = require("../../../log")

exports.targetChampionSkillInfoSave = async (
    champId,
    qSkillInfo,
    wSkillInfo,
    eSkillInfo,
    rSkillInfo,
    passiveInfo
) => {
    try {
        await ChampSkill.createQueryBuilder()
            .insert()
            .values({
                champId,
                skill_id: qSkillInfo.id,
                skill_name: qSkillInfo.name,
                skill_desc: qSkillInfo.desc,
                skill_tool_tip: qSkillInfo.tooltip,
                skill_img: qSkillInfo.image,
            })
            .execute()

        await ChampSkill.createQueryBuilder()
            .insert()
            .values({
                champId,
                skill_id: wSkillInfo.id,
                skill_name: wSkillInfo.name,
                skill_desc: wSkillInfo.desc,
                skill_tool_tip: wSkillInfo.tooltip,
                skill_img: wSkillInfo.image,
            })
            .execute()

        await ChampSkill.createQueryBuilder()
            .insert()
            .values({
                champId,
                skill_id: eSkillInfo.id,
                skill_name: eSkillInfo.name,
                skill_desc: eSkillInfo.desc,
                skill_tool_tip: eSkillInfo.tooltip,
                skill_img: eSkillInfo.image,
            })
            .execute()

        await ChampSkill.createQueryBuilder()
            .insert()
            .values({
                champId,
                skill_id: rSkillInfo.id,
                skill_name: rSkillInfo.name,
                skill_desc: rSkillInfo.desc,
                skill_tool_tip: rSkillInfo.tooltip,
                skill_img: rSkillInfo.image,
            })
            .execute()

        await ChampSkill.createQueryBuilder()
            .insert()
            .values({
                champId,
                skill_id: passiveInfo.id,
                skill_name: passiveInfo.name,
                skill_desc: passiveInfo.desc,
                skill_img: passiveInfo.image,
            })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from targetChampionSkillInfoSave` })
    }
}

exports.targetChampionSkillInfoUpdate = async (
    champId,
    qSkillInfo,
    wSkillInfo,
    eSkillInfo,
    rSkillInfo,
    passiveInfo
) => {
    try {
        await ChampSkill.createQueryBuilder()
            .update(ChampSkill)
            .set({
                skill_name: qSkillInfo.name,
                skill_desc: qSkillInfo.desc,
                skill_tool_tip: qSkillInfo.tooltip,
                skill_img: qSkillInfo.image,
            })
            .where("champId = :champId", { champId })
            .andWhere("skill_id = :skillId", { skillId: qSkillInfo.id })
            .execute()
        await ChampSkill.createQueryBuilder()
            .update(ChampSkill)
            .set({
                skill_name: wSkillInfo.name,
                skill_desc: wSkillInfo.desc,
                skill_tool_tip: wSkillInfo.tooltip,
                skill_img: wSkillInfo.image,
            })
            .where("champId = :champId", { champId })
            .andWhere("skill_id = :skillId", { skillId: wSkillInfo.id })
            .execute()
        await ChampSkill.createQueryBuilder()
            .update(ChampSkill)
            .set({
                skill_id: eSkillInfo.id,
                skill_name: eSkillInfo.name,
                skill_desc: eSkillInfo.desc,
                skill_tool_tip: eSkillInfo.tooltip,
                skill_img: eSkillInfo.image,
            })
            .where("champId = :champId", { champId })
            .andWhere("skill_id = :skillId", { skillId: eSkillInfo.id })
            .execute()
        await ChampSkill.createQueryBuilder()
            .update(ChampSkill)
            .set({
                skill_id: rSkillInfo.id,
                skill_name: rSkillInfo.name,
                skill_desc: rSkillInfo.desc,
                skill_tool_tip: rSkillInfo.tooltip,
                skill_img: rSkillInfo.image,
            })
            .where("champId = :champId", { champId })
            .andWhere("skill_id = :skillId", { skillId: rSkillInfo.id })
            .execute()
        await ChampSkill.createQueryBuilder()
            .update(ChampSkill)
            .set({
                skill_id: passiveInfo.id,
                skill_name: passiveInfo.name,
                skill_desc: passiveInfo.desc,
                skill_img: passiveInfo.image,
            })
            .where("champId = :champId", { champId })
            .andWhere("skill_id = :skillId", { skillId: passiveInfo.id })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from targetChampionSkillInfoUpdate` })
    }
}

exports.getTooltip = async () => {
    try {
        return await ChampSkill.createQueryBuilder().select().getMany()
    } catch (err) {
        logger.error(err, { message: ` - from getTooltip` })
    }
}

exports.editToolTip = async (skill_id, champId, skill_tool_tip, skill_desc) => {
    try {
        await ChampSkill.createQueryBuilder()
            .update(ChampSkill)
            .set({ skill_tool_tip, skill_desc })
            .where("champId = :champId", { champId })
            .andWhere("skill_id = :skill_id", { skill_id })
            .execute()
    } catch (err) {
        logger.error(err, { message: ` - from editToolTip` })
    }
}
