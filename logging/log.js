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

exports.taskSuccessLogging = async (step) => {
    const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0]
    const time = new Date().toTimeString().split(" ")[0]
    const data = `\n ${step} 성공 | Date: ${date} Time:${time}`
    fs.writeFile(
        process.env.TASK_SUCCESS_LOG || `./logs/task.success.log.txt`,
        data,
        { flag: "a+" },
        (error) => {
            console.log(err)
        }
    )
}

exports.taskErrLogging = async (err, step) => {
    const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0]
    const time = new Date().toTimeString().split(" ")[0]
    const data = `\n ${step} 실패 | task error: ${err} | Date: ${date} Time:${time}`
    fs.writeFile(
        process.env.TASK_FAIL_LOG || `./logs/task.fail.log.txt`,
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
        (error) => { }
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

exports.matchIdLogging = async (matchIdLength, step) => {
    const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0]
    const time = new Date().toTimeString().split(" ")[0]
    const data = `\n ${step} 시작 | mathId: ${matchIdLength}개 분석 | Date: ${date} Time:${time}`

    fs.writeFile(
        process.env.MATCHID_LOG || `./logs/champ.analyze.matchId.txt`,
        data,
        { flag: "a+" },
        (error) => { }
    )
}
