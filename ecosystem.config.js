module.exports = {
    apps: [
        {
            name: "handler",
            script: "./handler.js",
            cron_restart: "* 13 * * *",
        },
    ],
}
