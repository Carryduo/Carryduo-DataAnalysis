const fs = require("fs")
const { sleep } = require("../../timer")
const axios = require("axios")
const {
    matchIdList,
    updateRate,
    saveChampId,
    addBanCnt,
    getMatchIdCnt,
    getChampList,
    ServiceSaveRate,
    addPositionCnt,
    positionInfo,
    findSpellInfoData,
    updateChampSpellInfo,
    saveChampSpellInfo,
    spellTotalCnt,
    findSpellData,
    ServiceSaveSpell,
    ServicePosition,
    successAnalyzed,
    dropAnalyzed,
    ServicefindSpellInfoData,
    ServiceUpdateChampSpellInfo,
} = require("./rate.service")

let key = 0
let status

//==========================================================================================================//
//라이엇 매치데이터 요청
async function requestRiotAPI(matchId) {
    try {
        const matchDataApiUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${process.env.KEY}`
        const response = await axios.get(matchDataApiUrl)
        const matchData = response.data
        return matchData
    } catch (err) {
        if (!err.response) {
            console.log("라이엇으로부터 err.response가 없다! ")
            console.log(key + " 번째 부터 오류!")
            return key++
        }
        if (err.response.status === 429) {
            console.log("라이엇 요청 제한 경고!")
            console.log(key + " 번째 부터 오류!")
            await sleep(125)
            return
        } else if (err.response.status === 403) {
            console.log("api키 갱신 필요!")
            return
        } else {
            console.log(err.response.status, err.response.statusText)
            status = err.response.status
            return key++
        }
    }
}
//==========================================================================================================//
//데이터 수집 및 분석 로직 실행
exports.startChampInfo = async () => {
    try {
        const data = await matchIdList()
        while (key !== data.length) {
            if (status !== undefined) {
                status = undefined
                continue
            }
            const matchData = await requestRiotAPI(data[key].matchid_matchId)
            await rate(matchData)
            await position(matchData)
            await champSpell(matchData)
            key++
        }
        key = 0
        return "champ info 분석 성공"
    } catch (error) {
        console.log(error)
        return { error, message: "champ info 분석 실패" }
    }
}

//==========================================================================================================//
//챔프 스펠 정보 연산 후 서비스 DB로 저장
exports.serviceSaveChampSpell = async () => {
    try {
        const spellData = await findSpellData()
        for (let s of spellData) {
            const spell1 = s.champspell_spell1
            const spell2 = s.champspell_spell2
            const champId = s.champspell_champId
            const sampleNum = s.champspell_sampleNum
            const spellTotal = await spellTotalCnt(champId)
            let pickRate = (s.champspell_sampleNum / spellTotal.total) * 100
            pickRate = pickRate.toFixed(2)

            const spellData = await ServicefindSpellInfoData(champId, spell1, spell2)
            if (!spellData) {
                await ServiceSaveSpell(champId, spell1, spell2, pickRate, sampleNum)
            } else if (spellData) {
                await ServiceUpdateChampSpellInfo(champId, spell1, spell2, pickRate, sampleNum)
            }
        }

        return "스펠 데이터 서비스DB 업데이트 완료"
    } catch (err) {
        return { err, message: "스펠 데이터 서비스DB 업데이트 실패" }
    }
}

//==========================================================================================================//
//챔프 포지션 연산 후 서비스 DB로 저장
exports.serviceSavePosition = async () => {
    try {
        const champList = await getChampList()

        for (let c of champList) {
            const champId = c.champ_champId

            const champPosition = await positionInfo(champId)

            // 해당 챔피언의 모든 포지션 카운트를 더해 총 카운트를 찾는다.
            const totalRate =
                champPosition[0].top +
                champPosition[0].jungle +
                champPosition[0].mid +
                champPosition[0].ad +
                champPosition[0].support

            //챔피언 포지션 비율 연산
            let topRate = (champPosition[0].top / totalRate) * 100
            topRate = topRate.toFixed(2)

            let jungleRate = (champPosition[0].jungle / totalRate) * 100
            jungleRate = jungleRate.toFixed(2)

            let midRate = (champPosition[0].mid / totalRate) * 100
            midRate = midRate.toFixed(2)

            let adRate = (champPosition[0].ad / totalRate) * 100
            adRate = adRate.toFixed(2)

            let supportRate = (champPosition[0].support / totalRate) * 100
            supportRate = supportRate.toFixed(2)

            await ServicePosition(champId, topRate, jungleRate, midRate, adRate, supportRate)
        }
        return "포지션 데이터 서비스DB 업데이트 완료"
    } catch (err) {
        return { err, message: "포지션 데이터 서비스DB 업데이트 실패" }
    }
}
//==========================================================================================================//
// 챔프 승/ 픽/ 벤 연산 후 서비스 DB로 저장
exports.serviceSaveRate = async () => {
    try {
        const champList = await getChampList()
        const totalCnt = await getMatchIdCnt()
        for (let c of champList) {
            const champId = c.champ_champId

            //챔피언 승, 픽, 밴 연산
            let winRate = (c.champ_win / c.champ_sampleNum) * 100
            winRate = winRate.toFixed(2)

            let pickRate = (c.champ_sampleNum / totalCnt) * 100
            pickRate = pickRate.toFixed(2)

            let banRate = (c.champ_banCount / totalCnt) * 100
            banRate = banRate.toFixed(2)
            await ServiceSaveRate(champId, winRate, pickRate, banRate)
        }
        return "승/패/벤 데이터 서비스DB 업데이트 완료"
    } catch (err) {
        return { err, message: "승/패/벤 데이터 서비스DB 업데이트 실패" }
    }
}

//==========================================================================================================//
//챔프 스펠 정보 저장
async function champSpell(data) {
    try {
        let analyzedOption
        let dropAnalyzedOption
        console.log(
            `============================================쳄프 스펠 저장 ${key}번============================================`
        )
        const matchId = data.metadata.matchId
        if (data.info.gameMode === "CLASSIC" && data.info.queueId === 420) {
            const participants = data.info.participants

            // 챔피언 스펠 정보 관련
            for (let v of participants) {
                const champId = v.championId
                const champName = v.championName
                const spell1 = v.summoner1Id
                const spell2 = v.summoner2Id

                const spellData = await findSpellInfoData(champId, spell1, spell2)
                // 해당 하는 표본이 없을 경우 생성, 있을 경우 업데이트
                if (!spellData) {
                    await saveChampSpellInfo(champId, champName, spell1, spell2)
                } else if (spellData) {
                    await updateChampSpellInfo(champId, spell1, spell2)
                }
            }
            analyzedOption = {
                set: { spellAnalyzed: 1 },
            }
            await successAnalyzed(matchId, analyzedOption)
        } else {
            dropAnalyzedOption = {
                set: { spellAnalyzed: 2 },
            }
            await dropAnalyzed(matchId, dropAnalyzedOption)
        }
    } catch (err) {
        return { err, message: "챔프 스펠 데이터분석 실패" }
    }
}

//==========================================================================================================//
//챔프 포지션 카운팅
async function position(data) {
    try {
        let analyzedOption
        let dropAnalyzedOption
        console.log(
            `============================================챔프 포지션 카운팅 ${key}번============================================`
        )
        const matchId = data.metadata.matchId
        if (data.info.gameMode === "CLASSIC" && data.info.queueId === 420) {
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
        } else {
            dropAnalyzedOption = {
                set: { positionAnalyzed: 2 },
            }
            await dropAnalyzed(matchId, dropAnalyzedOption)
        }
    } catch (err) {
        return { err, message: "챔프 포지션 데이터분석 실패" }
    }
}

//==========================================================================================================//
//챔피언 win, lose, ban 카운팅
async function rate(data) {
    try {
        let analyzedOption
        let dropAnalyzedOption
        console.log(
            `============================================승/패/밴 카운팅 ${key}번============================================`
        )

        const matchId = data.metadata.matchId

        if (data.info.gameMode === "CLASSIC" && data.info.queueId === 420) {
            const participants = data.info.participants
            //win, lose 카운팅
            for (let v of participants) {
                const champId = v.championId
                let optionWinRate
                if (v.win) {
                    optionWinRate = {
                        set: { win: () => "win+1", sampleNum: () => "sampleNum+1" },
                    }
                } else {
                    optionWinRate = {
                        set: { lose: () => "lose+1", sampleNum: () => "sampleNum+1" },
                    }
                }
                await updateRate(champId, optionWinRate)
            }
            // 카운팅 후 카운팅한 matchId 상태값 변경
            analyzedOption = {
                set: { rateAnalyzed: 1 },
            }
            await successAnalyzed(matchId, analyzedOption)

            //ban 카운팅
            const teams = data.info.teams
            for (let t of teams) {
                const ban = t.bans
                for (let b of ban) {
                    const champId = b.championId
                    if (b.chmapionId === -1) continue
                    await addBanCnt(champId)
                }
            }
            //밴 카운팅 후 카운팅한 matchId 상태값 변경
            analyzedOption = {
                set: { banAnalyzed: 1 },
            }
            await successAnalyzed(matchId, analyzedOption)
        } else {
            //조건에 안맞는 matchId면 각각 상태값 2로 변경
            dropAnalyzedOption = {
                set: { rateAnalyzed: 2 },
            }
            await dropAnalyzed(matchId, dropAnalyzedOption)

            dropAnalyzedOption = {
                set: { banAnalyzed: 2 },
            }
            await dropAnalyzed(matchId, dropAnalyzedOption)
        }
    } catch (err) {
        return { err, message: "챔프 승,밴,픽 데이터분석 실패" }
    }
}

//==========================================================================================================//
//챔피언 id, name 저장
exports.saveChampInfo = async () => {
    try {
        let champName = []

        const response = await axios.get(
            `https://ddragon.leagueoflegends.com/cdn/12.17.1/data/ko_KR/champion.json`
        )
        const champData = response.data.data

        champName.push(...Object.keys(champData))

        for (let i of champName) {
            await saveChampId(i, response.data.data[i].key)
        }
        return "챔피언ID 및 이름 저장 완료"
    } catch (err) {
        console.log(err)
        return err
    }
}
