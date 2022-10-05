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
        require("./entity/summoner.id"),
        require("./entity/puuid"),
        require("./entity/match.id"),
        require("./entity/match.data"),
        require("./entity/combination.data"),
        require("./entity/champ.info.data"),
        require("./entity/combination.service.data"),
        require("./entity/champ.spell.data"),
    ],
})

// const puuidController = require("./data/puuId/puuId.controller")

const dataSource_service = new typeorm.DataSource({
    type: "mysql",
    host: process.env.SERVICE_DB_HOST,
    port: process.env.SERVICE_DB_PORT,
    username: process.env.SERVICE_DB_USERNAME,
    password: process.env.SERVICE_DB_PASSWORD,
    database: process.env.SERVICE_DB_NAME,
    synchronize: false,
    logging: false,
    entities: [require("./service.entity/champ"), require("./service.entity/combination.stat")],
})

module.exports = {
    connect() {
        dataSource
            .initialize()
            .then(function () {
                console.log("분석용 연결 완료")
            })
            .catch(function (error) {
                console.log("Error: ", error)
            })
    },
    connectService() {
        dataSource_service
            .initialize()
            .then(function () {
                console.log("서비스용 연결 완료")
            })
            .catch(function (error) {
                console.log("Error: ", error)
            })
    },
    dataSource,
    dataSource_service,
}
