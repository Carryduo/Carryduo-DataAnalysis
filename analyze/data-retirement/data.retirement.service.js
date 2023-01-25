const { dataSource } = require("../../orm")
const combination = dataSource.getRepository("combination")
const simulation = dataSource.getRepository("simulation")
const simulation_service = dataSource.getRepository("simulation_service")

const champRate = dataSource.getRepository("champ_rate")
const champBan = dataSource.getRepository("champ_ban")
const champSpell = dataSource.getRepository("champ_spell")

const { dataSource_service } = require("../../service.orm")
const combination_stat = dataSource_service.getRepository("COMBINATION_STAT")

exports.findVersion_combination = async () => {
    return await combination.createQueryBuilder().select(["DISTINCT combination.version"]).getRawMany()
}

exports.deleteOutdatedData_combination = async (version) => {
    try {
        // console.log(version)
        await combination.createQueryBuilder().delete().where("combination.version = :version", { version }).execute()

        return
    } catch (err) {
        console.log(err)
    }
}

exports.findVersion_combination_service = async () => {
    return await combination_stat.createQueryBuilder().select(["DISTINCT COMBINATION_STAT.version"]).getRawMany()
}

exports.deleteOutdatedData_combination_service = async (version) => {
    try {
        // console.log(version)
        await combination_stat
            .createQueryBuilder()
            .delete()
            .where("COMBINATION_STAT.version = :version", { version })
            .execute()
        return
    } catch (err) {
        console.log(err)
    }
}

exports.findVersion_simulation = async () => {
    return await simulation.createQueryBuilder().select(["DISTINCT simulation.version"]).getRawMany()
}

exports.deleteOutdatedData_simulation = async (version) => {
    try {
        // console.log(version)
        await simulation.createQueryBuilder().delete().where("simulation.version = :version", { version }).execute()
        await simulation_service
            .createQueryBuilder()
            .delete()
            .where("simulation_service.version = :version", { version })
            .execute()
        return
    } catch (err) {
        console.log(err)
    }
}

//champ
exports.findVersion_champ = async () => {
    return await champRate.createQueryBuilder().select(["DISTINCT champ_rate.version"]).getRawMany()
}
exports.deleteOutdatedData_champ = async (version) => {
    try {
        // console.log(version)
        await champRate.createQueryBuilder().delete().where("champ_rate.version = :version", { version }).execute()
        await champBan.createQueryBuilder().delete().where("champ_ban.version = :version", { version }).execute()
        await champSpell.createQueryBuilder().delete().where("champ_spell.version = :version", { version }).execute()
        return
    } catch (err) {
        console.log(err)
        return
    }
}

exports.getMainpageData_analysisDB = async (version) => {
    try {
        const category0 = await combination
            .createQueryBuilder()
            .select()
            .where("combination.category = :category", { category: 0 })
            .andWhere("combination.version = :version", { version })
            .andWhere("combination.sampleNum >= :sampleNum", { sampleNum: 30 })
            .orderBy({ "(combination.sampleNum) * 0.3 + (combination.win/combination.sampleNum) * 100 * 0.7": "DESC" })
            .limit(30)
            .getMany()
        const category1 = await combination
            .createQueryBuilder()
            .select()
            .where("combination.category = :category", { category: 1 })
            .andWhere("combination.version = :version", { version })
            .andWhere("combination.sampleNum >= :sampleNum", { sampleNum: 30 })
            .orderBy({ "(combination.sampleNum) * 0.3 + (combination.win/combination.sampleNum) * 100 * 0.7": "DESC" })
            .limit(30)
            .getMany()

        const category2 = await combination
            .createQueryBuilder()
            .select()
            .where("combination.category = :category", { category: 2 })
            .andWhere("combination.version = :version", { version })
            .andWhere("combination.sampleNum >= :sampleNum", { sampleNum: 30 })
            .orderBy({ "(combination.sampleNum) * 0.3 + (combination.win/combination.sampleNum) * 100 * 0.7": "DESC" })
            .limit(30)
            .getMany()
        return { category0: category0.length, category1: category1.length, category2: category2.length }
    } catch (err) {
        console.log(err)
        return
    }
}

exports.getMainpageData_serviceDB = async (version) => {
    try {
        const category0 = await combination_stat
            .createQueryBuilder()
            .select()
            .where("COMBINATION_STAT.category = :category", { category: 0 })
            .andWhere("COMBINATION_STAT.version = :version", { version })
            .andWhere("COMBINATION_STAT.sample_num >= :sampleNum", { sampleNum: 30 })
            .orderBy({
                "((COMBINATION_STAT.win/COMBINATION_STAT.sample_num) * 0.4 + ((COMBINATION_STAT.sample_num - (SELECT MIN(sample_num) FROM COMBINATION_STAT)) / ((SELECT MAX(sample_num) FROM COMBINATION_STAT) - (SELECT MIN(sample_num) FROM COMBINATION_STAT)) * 0.6 )) * 5":
                    "DESC",
            })
            .getCount()
        const category1 = await combination_stat
            .createQueryBuilder()
            .select()
            .where("COMBINATION_STAT.category = :category", { category: 1 })
            .andWhere("COMBINATION_STAT.version = :version", { version })
            .andWhere("COMBINATION_STAT.sample_num >= :sampleNum", { sampleNum: 30 })
            .orderBy({
                "((COMBINATION_STAT.win/COMBINATION_STAT.sample_num) * 0.4 + ((COMBINATION_STAT.sample_num - (SELECT MIN(sample_num) FROM COMBINATION_STAT)) / ((SELECT MAX(sample_num) FROM COMBINATION_STAT) - (SELECT MIN(sample_num) FROM COMBINATION_STAT)) * 0.6 )) * 5":
                    "DESC",
            })
            .getCount()

        const category2 = await combination_stat
            .createQueryBuilder()
            .select()
            .where("COMBINATION_STAT.category = :category", { category: 2 })
            .andWhere("COMBINATION_STAT.version = :version", { version })
            .andWhere("COMBINATION_STAT.sample_num >= :sampleNum", { sampleNum: 30 })
            .orderBy({
                "((COMBINATION_STAT.win/COMBINATION_STAT.sample_num) * 0.4 + ((COMBINATION_STAT.sample_num - (SELECT MIN(sample_num) FROM COMBINATION_STAT)) / ((SELECT MAX(sample_num) FROM COMBINATION_STAT) - (SELECT MIN(sample_num) FROM COMBINATION_STAT)) * 0.6 )) * 5":
                    "DESC",
            })
            .getCount()
        return { category0: category0, category1: category1, category2: category2 }
    } catch (err) {
        console.log(err)
        return
    }
}
