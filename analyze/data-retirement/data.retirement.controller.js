const logger = require("../../log")
const {
    findVersion_combination,
    deleteOutdatedData_combination,
    findVersion_combination_service,
    deleteOutdatedData_combination_service,
    findVersion_simulation,
    deleteOutdatedData_simulation,
    findVersion_winRate,
    deleteOutdatedData_winRate,
    findVersion_banRate,
    deleteOutdatedData_banRate,
    findVersion_position,
    deleteOutdatedData_position,
    findVersion_spell,
    deleteOutdatedData_spell,
    findVersion_champ_service,
    deleteOutdatedData_champ_service,
    getMainpageData_serviceDB,
} = require("./data.retirement.service")

exports.deleteOutdatedData = async (table) => {
    try {
        let findVersion, deleteOutdatedData, getMainPageData

        switch (table) {
            case "combination":
                findVersion = findVersion_combination
                deleteOutdatedData = deleteOutdatedData_combination
                getMainPageData = getMainpageData_serviceDB
                break
            case "combination_service":
                findVersion = findVersion_combination_service
                deleteOutdatedData = deleteOutdatedData_combination_service
                getMainPageData = getMainpageData_serviceDB
                break
            case "simulation":
                findVersion = findVersion_simulation
                deleteOutdatedData = deleteOutdatedData_simulation
                getMainPageData = getMainpageData_serviceDB
                break
            case "winRate":
                findVersion = findVersion_winRate
                deleteOutdatedData = deleteOutdatedData_winRate
                getMainPageData = getMainpageData_serviceDB
                break
            case "banRate":
                findVersion = findVersion_banRate
                deleteOutdatedData = deleteOutdatedData_banRate
                getMainPageData = getMainpageData_serviceDB
                break
            case "position":
                findVersion = findVersion_position
                deleteOutdatedData = deleteOutdatedData_position
                getMainPageData = getMainpageData_serviceDB
                break
            case "spell":
                findVersion = findVersion_spell
                deleteOutdatedData = deleteOutdatedData_spell
                getMainPageData = getMainpageData_serviceDB
                break
            case "champ_service":
                findVersion = findVersion_champ_service
                deleteOutdatedData = deleteOutdatedData_champ_service
                getMainPageData = getMainpageData_serviceDB
                break
            case "matchId":
                findVersion = findVersion_matchId
                deleteOutdatedData = deleteOutdatedData_matchId
        }
        logger.info(`outdated??? ???????????? ????????? ${table}?????? ?????? ??????`)
        // ???????????? ???????????? ?????? ???????????? ??????
        let originData = await findVersion()

        // ???????????? ??????????????? sort ?????? ?????? ????????? ?????????
        let data = []
        for (const value of originData) {
            data.push(value.version)
        }

        data = data.filter((version) => {
            if (version[version.length - 1] === ".") {
                version = version.slice(0, -1)
            }
            if (!isNaN(Number(version))) {
                return version
            }
        })
        data = data.sort((a, b) => {
            return b.split(".")[0] - a.split(".")[0]
        })
        let recentVersions = []
        let lastVersions = []
        const recentVersion = Number(String(data[0]).split(".")[0])
        for (let i = 0; i < data.length; i++) {
            const version = data[i]
            if (Number(version.split(".")[0]) < recentVersion) {
                lastVersions.push(version)
            } else {
                recentVersions.push(version)
            }
        }
        recentVersions = recentVersions.sort((a, b) => {
            return String(b).split(".")[1] - String(a).split(".")[1]
        })
        lastVersions = lastVersions.sort((a, b) => {
            return String(b).split(".")[1] - String(a).split(".")[1]
        })
        recentVersions.push(...lastVersions)
        // ?????? 2??? ?????? ???????????? ???????????? ??????
        logger.info(`${table}??? ???????????? ????????????: ${recentVersions}`)
        const status = await getMainPageData(recentVersions[0])
        let startPoint

        if (status.category0 === 30 && status.category1 === 30 && status.category2) {
            startPoint = 1
        }
        else {
            startPoint = 2
        }
        for (let i = startPoint; i < recentVersions.length; i++) {
            let version = recentVersions[i]
            // await deleteOutdatedData(version)
        }
        logger.info(`outdated??? ???????????? ${table} ????????? ?????? ??????`)
    } catch (err) {
        console.log(err)
    }
}
