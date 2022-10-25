require("dotenv").config()
const typeorm = require("typeorm")

const dataSource_service = new typeorm.DataSource({
    type: "mysql",
    host: process.env.SERVICE_DB_HOST,
    port: process.env.SERVICE_DB_PORT,
    username: process.env.SERVICE_DB_USERNAME,
    password: process.env.SERVICE_DB_PASSWORD,
    database: process.env.SERVICE_DB_NAME,
    synchronize: false,
    logging: false,
    entities: [
        require("./service.entity/champ"),
        require("./service.entity/champ.skill"),
        require("./service.entity/combination.stat"),
        require("./service.entity/champ.spell"),
        require("./service.entity/simulation"),
    ],
})
module.exports = {
    async connectService() {
        await dataSource_service
            .initialize()
            .then(function () {
                console.log("서비스용 연결 완료")
            })
            .catch(function (error) {
                console.log("Error: ", error)
            })
    },
    async closeService() {
        await dataSource_service.destroy().then(() => {
            console.log("서비스용 연결 해제")
        })
    },
    dataSource_service,
}
