const fs = require("fs")

exports.errLogging = async (err) => {
    const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0]
    const time = new Date().toTimeString().split(" ")[0]
    const data = "\nerror: " + err.toString() + " ||" + " Date: " + date + " Time: " + time

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
    const data = "\nmatchId length: " + matchIdLength.toString() + "개 분석"
    " ||" + " Date: " + date + " Time: " + time

    fs.writeFile(
        process.env.LOG || `./logs/champ.analyze.matchId.txt`,
        data,
        { flag: "a+" },
        (error) => {
            console.log(error)
        }
    )
}
