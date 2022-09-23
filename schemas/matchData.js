const mongoose = require("mongoose")
const autoIdSetter = require("./autoidsetter")

const matchData = mongoose.Schema(
    {
        data: {
            type: Object,
        },
    },
    { timestamps: true }
)
autoIdSetter(matchData, mongoose, "matchData", "matchDataCnt")
module.exports = mongoose.model("matchData", matchData)
