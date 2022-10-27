const { getPostionVersion, createPosition, updatePosition } = require("./position.service")
const { successAnalyzed } = require("../champInfo.service")
const logger = require("../../../log")
exports.position = async (data, key) => {
    try {
        let analyzedOption
        const matchId = data.metadata.matchId
        const version = data.info.gameVersion.substring(0, 5)
        const participants = data.info.participants

        for (let v of participants) {
            const champId = v.championId

            let create
            let update

            if (!v.teamPosition) {
                continue
            }
            switch (v.teamPosition) {
                case "TOP":
                    create = {
                        set: { champId, top: 1, version, sampleNum: 1 },
                    }
                    update = {
                        set: { top: () => "top+1", sampleNum: () => "sampleNum+1" },
                    }
                    break
                case "JUNGLE":
                    create = {
                        set: { champId, jungle: 1, version, sampleNum: 1 },
                    }
                    update = {
                        set: { jungle: () => "jungle+1", sampleNum: () => "sampleNum+1" },
                    }
                    break
                case "MIDDLE":
                    create = {
                        set: { champId, mid: 1, version, sampleNum: 1 },
                    }
                    update = {
                        set: { mid: () => "mid+1", sampleNum: () => "sampleNum+1" },
                    }
                    break
                case "BOTTOM":
                    create = {
                        set: { champId, ad: 1, version, sampleNum: 1 },
                    }
                    update = {
                        set: { ad: () => "ad+1", sampleNum: () => "sampleNum+1" },
                    }
                    break
                case "UTILITY":
                    create = {
                        set: { champId, support: 1, version, sampleNum: 1 },
                    }
                    update = {
                        set: { support: () => "support+1", sampleNum: () => "sampleNum+1" },
                    }
                    break
            }
            const versionCheck = await getPostionVersion(champId, version)
            if (!versionCheck) {
                //create
                await createPosition(create)
            } else if (versionCheck) {
                //update
                await updatePosition(champId, update, version)
            }
        }
        analyzedOption = {
            set: { positionAnalyzed: 1 },
        }
        // await successAnalyzed(matchId, analyzedOption)
    } catch (err) {
        logger.error(err, { message: "- from position" })
        return
    }
}
