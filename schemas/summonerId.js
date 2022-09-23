const mongoose = require("mongoose")
const autoIdSetter = require("./autoidsetter")

const summonerId = mongoose.Schema(
    {
        summonerId: {
            type: String,
            unique: true,
        },
    },
    { timestamps: true }
)
autoIdSetter(summonerId, mongoose, "summonerId", "summonerCnt")
module.exports = mongoose.model("summonerId", summonerId)
