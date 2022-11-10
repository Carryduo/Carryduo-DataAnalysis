const { dataSource } = require("../../orm")
const combination = dataSource.getRepository("combination")
const combination_service = dataSource.getRepository("combination_service")
const simulation = dataSource.getRepository("simulation")
const simulation_service = dataSource.getRepository("simulation_service")
const winRate = dataSource.getRepository("champ_win_rate")
const banRate = dataSource.getRepository("champban")
const position = dataSource.getRepository("champ_position")
const spell = dataSource.getRepository("champspell")
const spell_service = dataSource.getRepository("champspell_service")
const champ_service = dataSource.getRepository("champ_service")


// TODO: position, winrate, banrate, spell 삭제로직에 nestDB 쿼리도 추가
exports.findVersion_combination = async () => {
    return await combination
        .createQueryBuilder()
        .select(["DISTINCT combination.version"])
        .getRawMany()
}

exports.deleteOutdatedData_combination = async (version) => {
    try {
        console.log(version)
        await combination
            .createQueryBuilder()
            .delete()
            .where("combination.version = :version", { version })
            .execute()
        await combination_service
            .createQueryBuilder()
            .delete()
            .where("combination_service.version = :version", { version })
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
        console.log(version)
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
        console.log(version)
        await winRate
            .createQueryBuilder()
            .delete()
            .where("champ_win_rate.version = :version", { version })
            .execute()
        await champ_service
            .createQueryBuilder()
            .delete()
            .where("champ_service.version = :version", { version })
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
        console.log(version)
        await banRate
            .createQueryBuilder()
            .delete()
            .where("champban.version = :version", { version })
            .execute()
        await champ_service
            .createQueryBuilder()
            .delete()
            .where("champ_service.version = :version", { version })
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
        console.log(version)
        await position
            .createQueryBuilder()
            .delete()
            .where("champ_position.version = :version", { version })
            .execute()
        await champ_service
            .createQueryBuilder("champ")
            .delete()
            .where("champ_service.version = :version", { version })
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
        console.log(version)
        await spell
            .createQueryBuilder()
            .delete()
            .where("champspell.version = :version", { version })
            .execute()
        await spell_service
            .createQueryBuilder("spell_service")
            .delete()
            .where("champspell_service.version = :version", { version })
            .execute()
        return
    } catch (err) {
        console.log(err)
    }
}
