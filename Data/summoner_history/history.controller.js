exports.history = async (req, res, next) => {
    res.status(200).json({})
}

// info: {
//     gameCreation: 1662318399406,
//     gameDuration: 1752,
//     gameEndTimestamp: 1662320184118,
//     gameId: 6110902608,
//     gameMode: 'CLASSIC',
//     gameName: 'teambuilder-match-6110902608',
//     gameStartTimestamp: 1662318431891,
//     gameType: 'MATCHED_GAME',
//     gameVersion: '12.16.462.4391',
//     mapId: 11,
//     participants: [Array],
//     platformId: 'KR',
//     queueId: 420,
//     teams: [Array],
//     tournamentCode: ''
//   }

// exports.userRecord = async (req, res, next) => {
//     const summonerName = "할배탈"
//     const result = []
//     const userRecord = []
//     for (let i of matchArr) {
//         const matchDataApiUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/${i}?api_key=${process.env.KEY}`
//         const response = await axios.get(matchDataApiUrl)
//         result.push(response.data.info)
//     }
//     for (let r of result) {
//         if (r.gameMode === "CLASSIC") {
//             for (let p of r.participants) {
//                 if (p.summonerName === summonerName) {
//                     userRecord.push({
//                         kills: p.kills,
//                         deaths: p.deaths,
//                         assists: p.assists,
//                         championName: p.championName,
//                         lane: p.lane,
//                         win: p.win,
//                     })
//                 }
//             }
//         }
//     }
//     let win = 0
//     let lose = 0
//     let kill = []
//     let death = []
//     let assi = []
//     const champNameArr = []
//     const champNameResult = {}
//     let sortable = []
//     for (let u of userRecord) {
//         if (u.win === true) {
//             win++
//         } else {
//             lose++
//         }
//         kill.push(u.kills)
//         death.push(u.deaths)
//         assi.push(u.assists)
//         champNameArr.push(u.championName)
//     }
//     for (let k of kill) {
//     }
//     console.log({ win, lose, kill, death, assi })

//     champNameArr.map((x) => {
//         champNameResult[x] = (champNameResult[x] || 0) + 1
//     })

//     for (let cnr in champNameResult) {
//         sortable.push([cnr, champNameResult[cnr]])
//     }

//     sortable.sort(function (a, b) {
//         return b[1] - a[1]
//     })
//     let sortableSlice = sortable.slice(0, 3)
//     let sortResult = []
//     sortableSlice.map((v) => {
//         sortResult.push(...v)
//     })

//     let topChampList = []
//     for (let i = 0; i < sortResult.length; i++) {
//         if (i % 2 === 0) {
//             topChampList.push(sortResult[i])
//         }
//     }
//     const champWinRate = [] //[ 'Samira', 5, 'Amumu', 2, 'Blitzcrank', 2 ]

//     for (let u2 of userRecord) {
//         for (let tcl of topChampList) {
//             if (u2.championName === tcl) {
//                 console.log({
//                     champ: u2.championName,
//                     win: u2.win,
//                     kill: u2.kills,
//                     death: u2.deaths,
//                     assi: u2.assists,
//                     aver: (u2.kills + u2.assists) / u2.deaths,
//                 })
//             }
//         }
//     }
//     res.status(200).send({ result: "success" })
// }
