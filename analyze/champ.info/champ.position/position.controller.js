//챔프 포지션 카운팅
async function position(data, key) {
    try {
        let analyzedOption
        console.log(
            `============================================챔프 포지션 카운팅 ${key}번============================================`
        )
        const matchId = data.metadata.matchId
        const version = data.info.gameVersion.substring(0, 5)
        const participants = data.info.participants

        for (let v of participants) {
            const champId = v.championId
            let optionPosition
            if (!v.teamPosition) {
                continue
            }
            switch (v.teamPosition) {
                case "TOP":
                    optionPosition = {
                        set: { top: () => "top+1" },
                    }
                    break
                case "JUNGLE":
                    optionPosition = {
                        set: { jungle: () => "jungle+1" },
                    }
                    break
                case "MIDDLE":
                    optionPosition = {
                        set: { mid: () => "mid+1" },
                    }
                    break
                case "BOTTOM":
                    optionPosition = {
                        set: { ad: () => "ad+1" },
                    }
                    break
                case "UTILITY":
                    optionPosition = {
                        set: { support: () => "support+1" },
                    }
                    break
            }
            await addPositionCnt(champId, optionPosition)
        }
        analyzedOption = {
            set: { positionAnalyzed: 1 },
        }
        await successAnalyzed(matchId, analyzedOption)
    } catch (err) {
        logger.error(err, { message: "- from position" })
        return
    }
}
