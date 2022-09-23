const mongoose = require("mongoose")
const MONGOURI = process.env.MONGOURI

module.exports = () => {
    mongoose
        .connect(MONGOURI, { ignoreUndefined: true })
        .then(() => {
            console.log("mongodb 연결완료")
        })
        .catch((error) => {
            console.error(error)
        })
}
