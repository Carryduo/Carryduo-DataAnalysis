const logger = require("../../log")
const {
    findVersion_combination,
    deleteOutdatedData_combination,
    findVersion_combination_service,
    deleteOutdatedData_combination_service,
    findVersion_simulation,
    deleteOutdatedData_simulation,
    deleteOutdatedData_champ_service,
    getMainpageData_serviceDB,
    //champ
    findVersion_champ,
    deleteOutdatedData_champ,
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
            case "champ":
                findVersion = findVersion_champ
                deleteOutdatedData = deleteOutdatedData_champ
                getMainPageData = getMainpageData_serviceDB
                break
            // case "champ_service":
            //     findVersion = findVersion_champ_service
            //     deleteOutdatedData = deleteOutdatedData_champ_service
            //     break
            case "matchId":
                findVersion = findVersion_matchId
                deleteOutdatedData = deleteOutdatedData_matchId
        }
        logger.info(`outdated한 패치버전 데이터 ${table}에서 제거 시작`)
        // 테이블에 존재하는 모든 패치버전 조회
        let originData = await findVersion()

        // 패치버전 최신순으로 sort 위해 소수 자리만 남기기
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
        // 최신 2개 버전 제외하고 삭제하는 로직
        logger.info(`${table}에 남아있는 패치버전: ${recentVersions}`)
        const status = await getMainPageData(recentVersions[0])
        let startPoint

        console.log(status)
        if (status.category0 >= 30 && status.category1 >= 30 && status.category2 >= 30) {
            startPoint = 1
        } else {
            startPoint = 2
        }
        console.log(startPoint)
        for (let i = startPoint; i < recentVersions.length; i++) {
            let version = recentVersions[i]
            // await deleteOutdatedData(version)
        }
        logger.info(`outdated한 패치버전 ${table} 데이터 제거 완료`)
    } catch (err) {
        console.log(err)
    }
}
