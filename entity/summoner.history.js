var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "summonerhistory", // Will use table name `category` as default behaviour.
    tableName: "summonerhistory", // Optional: Provide `tableName` property to override the default behaviour for table name.
    columns: {
        id: {
            type: "varchar",
            primary: true,
            generated: "uuid",
        },
        win: {
            type: "int",
            require: true,
            default: 0,
        },
        lose: {
            type: "int",
            require: true,
            default: 0,
        },
        winRate: {
            type: "int",
            require: true,
            default: 0,
        },
        kill: {
            type: "int",
            require: true,
            default: 0,
        },
        death: {
            type: "int",
            require: true,
            default: 0,
        },
        assist: {
            type: "int",
            require: true,
            default: 0,
        },
        top: {
            type: "int",
            require: true,
            default: 0,
        },
        jungle: {
            type: "int",
            require: true,
            default: 0,
        },
        mid: {
            type: "int",
            require: true,
            default: 0,
        },
        ad: {
            type: "int",
            require: true,
            default: 0,
        },
        support: {
            type: "int",
            require: true,
            default: 0,
        },
        recent1Win: {
            type: "int",
            require: true,
            default: 0,
        },
        recent1Lose: {
            type: "int",
            require: true,
            default: 0,
        },
        recent2Win: {
            type: "int",
            require: true,
            default: 0,
        },
        recent2Lose: {
            type: "int",
            require: true,
            default: 0,
        },
        recent3Win: {
            type: "int",
            require: true,
            default: 0,
        },
        recent3Lose: {
            type: "int",
            require: true,
            default: 0,
        },
        recentChamp1: {
            type: "int",
            require: true,
            default: 0,
        },
        recentChamp2: {
            type: "int",
            require: true,
            default: 0,
        },
        recentChamp3: {
            type: "int",
            require: true,
            default: 0,
        },
        createdAt: {
            type: "timestamp",
            require: true,
            default: () => {
                return `NOW()`
            },
        },
        updatedAt: {
            type: "timestamp",
            require: true,
            default: () => {
                return `NOW()`
            },
        },
    },
})
