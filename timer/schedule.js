const schedule = require("node-schedule")
const { exec } = require("child_process")

module.exports = {
    pm2Schedule() {
        // 매일 오후 10시에 handler 앱을 중지
        schedule.scheduleJob("0 22 * * *", () => {
            console.log("Stopping handler app")
            exec("pm2 stop handler.js")
        })
    },
}
