const mongoose = require("mongoose")
const autoIdSetter = require("./autoidsetter")

const matchId = mongoose.Schema(
    {
        matchId: {
            type: String,
            unique: true,
        },
    },
    { timestamps: true }
)
autoIdSetter(matchId, mongoose, "matchId", "matchCnt")
module.exports = mongoose.model("matchId", matchId)
