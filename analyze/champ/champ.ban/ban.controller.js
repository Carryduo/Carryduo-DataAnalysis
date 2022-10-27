const { createBanCnt, updateBanCnt, deleteBanOldVersion, getBanVersion } = require("./ban.service")
const { successAnalyzed } = require("../champInfo.service")
const logger = require("../../../log")

exports.banRate = async (data, key) => {
    try {
        console.log(
            `=============================================밴 카운팅 ${key}번============================================`
        )
        const matchId = data.metadata.matchId
        const version = data.info.gameVersion.substring(0, 5)
        let champList = []

        const teams = data.info.teams
        for (let t of teams) {
            const ban = t.bans

            for (let b of ban) {
                const champId = b.championId

                if (champId === -1) {
                    console.log(champId)
                    continue
                }
                champList.push(champId)
            }
        }

        const setChampList = new Set(champList)
        const newChampLIst = [...setChampList]

        let option
        let banCount

        for (let nCL of newChampLIst) {
            const versionCheck = await getBanVersion(nCL, version)
            if (!versionCheck) {
                // create
                if (champList.indexOf(nCL) === champList.lastIndexOf(nCL)) {
                    banCount = 1
                    await createBanCnt(nCL, banCount, version)
                } else if (champList.indexOf(nCL) !== champList.lastIndexOf(nCL)) {
                    banCount = 2
                    await createBanCnt(nCL, banCount, version)
                }
            } else if (versionCheck) {
                //update
                if (champList.indexOf(nCL) === champList.lastIndexOf(nCL)) {
                    option = {
                        set: { banCount: () => "banCount+1", sampleNum: () => "sampleNum+1" },
                    }
                    await updateBanCnt(nCL, option, version)
                } else if (champList.indexOf(nCL) !== champList.lastIndexOf(nCL)) {
                    option = {
                        set: { banCount: () => "banCount+2", sampleNum: () => "sampleNum+1" },
                    }
                    await updateBanCnt(nCL, option, version)
                }
            }
        }
        await deleteBanOldVersion()
        analyzedOption = {
            set: { banAnalyzed: 1 },
        }
        await successAnalyzed(matchId, analyzedOption)
    } catch (err) {
        logger.error(err, { message: "- from banrate" })
        return
    }
}
