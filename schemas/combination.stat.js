
const mongoose = require("mongoose")
const autoIdSetter = require("./autoidsetter")

const combination = mongoose.Schema(
    {
        mainChampId: {
            type: String,
        },
        mainChampName: {
            type: String,
        },
        subChampId: {
            type: String,
        },
        subChampName: {
            type: String,
        },
        win: {
            type: Number,
        },
        lose: {
            type: Number
        },
        sampleNum: {
            type: Number
        },
        type: {
            type: Number
        }
    },
    { timestamps: true }
)
autoIdSetter(combination, mongoose, "combination", "combinationCnt")
module.exports = mongoose.model("combination", combination)
