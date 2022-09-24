const mongoose = require("mongoose")
const autoIdSetter = require("./autoidsetter")

const champInfo = mongoose.Schema(
    {
        id: {
            type: Number,
            unique: true,
        },
        name: {
            type: String,
            unique: true,
        },
        win: {
            type: Number,
            default: 0,
        },
        lose: {
            type: Number,
            default: 0,
        },
        ban: {
            type: Number,
            default: 0,
        },
        game: {
            type: Number,
        },
    },
    { timestamps: true }
)
autoIdSetter(champInfo, mongoose, "champInfo", "champInfoCnt")
module.exports = mongoose.model("champInfo", champInfo)
