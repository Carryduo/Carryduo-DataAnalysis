const { dataSource } = require("../../orm")
const combination = dataSource.getRepository("combination")
const simulation = dataSource.getRepository("simulation")
const simulation_service = dataSource.getRepository("simulation_service")
const winRate = dataSource.getRepository("champ_win_rate")
const banRate = dataSource.getRepository("champban")
const position = dataSource.getRepository("champ_position")
const spell = dataSource.getRepository("champspell")
const spell_service = dataSource.getRepository("champspell_service")
const champ_service = dataSource.getRepository("champ_service")

const { dataSource_service } = require("../../service.orm")
const combination_stat = dataSource_service.getRepository("COMBINATION_STAT")
const rate_stat = dataSource_service.getRepository("CHAMPRATE")
const spell_stat = dataSource_service.getRepository("CHAMPSPELL")

exports.findVersion_combination = async () => {
    return await combination
        .createQueryBuilder()
        .select(["DISTINCT combination.version"])
        .getRawMany()
}

exports.deleteOutdatedData_combination = async (version) => {
    try {
        // console.log(version)
        await combination
            .createQueryBuilder()
            .delete()
            .where("combination.version = :version", { version })
            .execute()

        return
    } catch (err) {
        console.log(err)
    }
}

exports.findVersion_combination_service = async () => {
    return await combination_stat
        .createQueryBuilder()
        .select(["DISTINCT COMBINATION_STAT.version"])
        .getRawMany()
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
    return await simulation
        .createQueryBuilder()
        .select(["DISTINCT simulation.version"])
        .getRawMany()
}

exports.deleteOutdatedData_simulation = async (version) => {
    try {
        // console.log(version)
        await simulation
            .createQueryBuilder()
            .delete()
            .where("simulation.version = :version", { version })
            .execute()
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

exports.findVersion_winRate = async () => {
    return await winRate.createQueryBuilder("win").select(["DISTINCT win.version"]).getRawMany()
}
exports.deleteOutdatedData_winRate = async (version) => {
    try {
        // console.log(version)
        await winRate
            .createQueryBuilder()
            .delete()
            .where("champ_win_rate.version = :version", { version })
            .execute()
        return
    } catch (err) {
        console.log(err)
    }
}

exports.findVersion_banRate = async () => {
    return await banRate.createQueryBuilder("ban").select(["DISTINCT ban.version"]).getRawMany()
}
exports.deleteOutdatedData_banRate = async (version) => {
    try {
        // console.log(version)
        await banRate
            .createQueryBuilder()
            .delete()
            .where("champban.version = :version", { version })
            .execute()
        return
    } catch (err) {
        console.log(err)
    }
}

exports.findVersion_position = async () => {
    return await position
        .createQueryBuilder("position")
        .select(["DISTINCT position.version"])
        .getRawMany()
}
exports.deleteOutdatedData_position = async (version) => {
    try {
        // console.log(version)
        await position
            .createQueryBuilder()
            .delete()
            .where("champ_position.version = :version", { version })
            .execute()
        return
    } catch (err) {
        console.log(err)
    }
}

exports.findVersion_spell = async () => {
    return await spell.createQueryBuilder("spell").select(["DISTINCT spell.version"]).getRawMany()
}
exports.deleteOutdatedData_spell = async (version) => {
    try {
        // console.log(version)
        await spell
            .createQueryBuilder()
            .delete()
            .where("champspell.version = :version", { version })
            .execute()
        await spell_service
            .createQueryBuilder()
            .delete()
            .where("champspell_service.version = :version", { version })
            .execute()
        await spell_stat
            .createQueryBuilder()
            .delete()
            .where("CHAMPSPELL.version = :version", { version })
            .execute()
        return
    } catch (err) {
        console.log(err)
    }
}

exports.findVersion_champ_service = async () => {
    return await champ_service
        .createQueryBuilder("champ")
        .select(["DISTINCT champ.version"])
        .getRawMany()
}
exports.deleteOutdatedData_champ_service = async (version) => {
    try {
        // console.log(version)
        await champ_service
            .createQueryBuilder()
            .delete()
            .where("champ_service.version = :version", { version })
            .execute()
        await rate_stat
            .createQueryBuilder()
            .delete()
            .where("CHAMPRATE.version = :version", { version })
            .execute()
        return
    } catch (err) {
        console.log(err)
    }
}

exports.getMainpageData_analysisDB = async (version) => {
    try {
        const category0 =
            await combination.createQueryBuilder()
                .select()
                .where('combination.category = :category', { category: 0 })
                .andWhere('combination.sampleNum >= :sampleNum', { sampleNum: 10 })
                .andWhere('combination.version = :version', { version })
                .orderBy('combination.win/combination.sampleNum', 'DESC')
                .limit(30)
                .getMany()
        const category1 =
            await combination.createQueryBuilder()
                .select()
                .where('combination.category = :category', { category: 1 })
                .andWhere('combination.sampleNum >= :sampleNum', { sampleNum: 10 })
                .andWhere('combination.version = :version', { version })
                .orderBy('combination.win/combination.sampleNum', 'DESC')
                .limit(30)
                .getMany()

        const category2 =
            await combination.createQueryBuilder()
                .select()
                .where('combination.category = :category', { category: 2 })
                .andWhere('combination.sampleNum >= :sampleNum', { sampleNum: 10 })
                .andWhere('combination.version = :version', { version })
                .orderBy('combination.win/combination.sampleNum', 'DESC')
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
        const category0 =
            await combination_stat.createQueryBuilder()
                .select()
                .where('COMBINATION_STAT.category = :category', { category: 0 })
                .andWhere('COMBINATION_STAT.sample_num >= :sample_num', { sample_num: 10 })
                .andWhere('COMBINATION_STAT.version = :version', { version })
                .orderBy('COMBINATION_STAT.win/COMBINATION_STAT.sample_num', 'DESC')
                .limit(30)
                .getMany()
        const category1 =
            await combination_stat.createQueryBuilder()
                .select()
                .where('COMBINATION_STAT.category = :category', { category: 1 })
                .andWhere('COMBINATION_STAT.sample_num >= :sample_num', { sample_num: 10 })
                .andWhere('COMBINATION_STAT.version = :version', { version })
                .orderBy('COMBINATION_STAT.win/COMBINATION_STAT.sample_num', 'DESC')
                .limit(30)
                .getMany()

        const category2 =
            await combination_stat.createQueryBuilder()
                .select()
                .where('COMBINATION_STAT.category = :category', { category: 2 })
                .andWhere('COMBINATION_STAT.sample_num >= :sample_num', { sample_num: 10 })
                .andWhere('COMBINATION_STAT.version = :version', { version })
                .orderBy('COMBINATION_STAT.win/COMBINATION_STAT.sample_num', 'DESC')
                .limit(30)
                .getMany()
        return { category0: category0.length, category1: category1.length, category2: category2.length }
    } catch (err) {
        console.log(err)
        return
    }
}