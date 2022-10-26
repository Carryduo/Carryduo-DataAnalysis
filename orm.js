require("dotenv").config()
const typeorm = require("typeorm")

const dataSource = new typeorm.DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.USER_NAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    synchronize: false,
    logging: false,
    entities: [
        require("./entity/match.id"),
        require("./entity/combination.data"),
        require("./entity/champ.info.data"),
        require("./entity/combination.service.data"),
        require("./entity/champ.spell.data"),
        require("./entity/simulation.service.data"),
        require("./entity/simulation.data"),
    ],
    migrations: ["migrations/*.js"],
    migrationsDir: ["./migrations"],
    migrationsTableName: "migration",
})

// const puuidController = require("./data/puuId/puuId.controller")

module.exports = {
    async connect() {
        await dataSource
            .initialize()
            .then(function () {
                console.log("분석용 연결 완료")
            })
            .catch(function (error) {
                console.log("Error: ", error)
            })
    },
    async close() {
        await dataSource.destroy().then(() => {
            console.log("분석용 연결 해제")
        })
    },
    dataSource,
}
