const mongoose = require("mongoose")
const autoIdSetter = require("./autoidsetter")

const puuId = mongoose.Schema(
    {
        puuId: {
            type: String,
            unique: true,
        },
    },
    { timestamps: true }
)
autoIdSetter(puuId, mongoose, "puuId", "puuIdCnt")
module.exports = mongoose.model("puuId", puuId)
