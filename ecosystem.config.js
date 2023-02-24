module.exports = {
    apps: [
        {
            name: "carryduo-dataAnalysis",
            script: "./handler.js",
            cron_restart: "0 13 * * *",
            cron_stop: "25 10 * * *",
        },
    ],
}
