require('dotenv').config()
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
    entities: [require("./entity/summoner.id"), require("./entity/puuid"), require("./entity/match.id"), require("./entity/match.data"), require('./entity/combination.data'), require('./entity/champ.info.data')],
})

module.exports = {
    connect() {
        dataSource
            .initialize()
            .then(function () {
                console.log('mysql 연결 완료')
            })
            .catch(function (error) {
                console.log("Error: ", error)
            })
    }, dataSource
} 