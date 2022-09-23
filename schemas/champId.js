const mongoose = require("mongoose")
const autoIdSetter = require("./autoidsetter")

const champId = mongoose.Schema(
    {
        champId: {
            type: String,
            unique: true,
        },
    },
    { timestamps: true }
)
autoIdSetter(champId, mongoose, "champId", "champCnt")
module.exports = mongoose.model("champId", champId)
