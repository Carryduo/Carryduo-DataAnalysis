module.exports = {
    apps: [
        {
            name: "handler",
            script: "./handler.js",
            cron_restart: "10 13 * * *",
        },
    ],
}
