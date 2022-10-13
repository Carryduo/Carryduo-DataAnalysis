const fs = require("fs")

exports.analyzeErrLogging = async (err) => {
    const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0]
    const time = new Date().toTimeString().split(" ")[0]
    const data = `\nanalyze error: ${err} | Date: ${date} Time:${time}`
    fs.writeFile(
        process.env.LOG || `./logs/champ.analyze.error.txt`,
        data,
        { flag: "a+" },
        (error) => {
            console.log(err)
        }
    )
}

exports.taskErrLogging = async (err) => {
    const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0]
    const time = new Date().toTimeString().split(" ")[0]
    const data = `\ntask error: ${err} | Date: ${date} Time:${time}`
    fs.writeFile(
        process.env.LOG || `./logs/champ.analyze.error.txt`,
        data,
        { flag: "a+" },
        (error) => {
            console.log(err)
        }
    )
}

exports.apiKeyStatusLogging = async () => {
    const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0]
    const time = new Date().toTimeString().split(" ")[0]
    const data = `\API status: API 키 만료 | Date: ${date} Time:${time}`
    fs.writeFile(
        process.env.LOG || `./logs/champ.analyze.error.txt`,
        data,
        { flag: "a+" },
        (error) => {}
    )
}

exports.champInfoErrLogging = async (err) => {
    const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0]
    const time = new Date().toTimeString().split(" ")[0]
    const data = `\champInfo error: ${err} | Date: ${date} Time:${time}`
    fs.writeFile(
        process.env.LOG || `./logs/champ.analyze.error.txt`,
        data,
        { flag: "a+" },
        (error) => {
            console.log(err)
        }
    )
}

exports.matchIdLogging = async (matchIdLength) => {
    const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0]
    const time = new Date().toTimeString().split(" ")[0]
    const data = `\nmathId: ${matchIdLength}개 분석 | Date: ${date} Time:${time}`

    fs.writeFile(
        process.env.MATCHID_LOG || `./logs/champ.analyze.matchId.txt`,
        data,
        { flag: "a+" },
        (error) => {}
    )
}
