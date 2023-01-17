var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "simulation", // Will use table name `category` as default behaviour.
    tableName: "simulation", // Optional: Provide `tableName` property to override the default behaviour for table name.
    columns: {
        id: {
            type: "varchar",
            primary: true,
            generated: "uuid",
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
        matchId: {
            type: "varchar",
            require: true,
        },
        champ1Id: {
            type: "int",
            require: true,
        },
        champ1Name: {
            type: "varchar",
            require: true,
        },
        champ2Id: {
            type: "int",
            require: true,
        },
        champ2Name: {
            type: "varchar",
            require: true,
        },
        champ3Id: {
            type: "int",
            require: true,
        },
        champ3Name: {
            type: "varchar",
            require: true,
        },
        champ4Id: {
            type: "int",
            require: true,
        },
        champ4Name: {
            type: "varchar",
            require: true,
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
        sampleNum: {
            type: "int",
            require: true,
            default: 0,
        },
        category: {
            type: "int",
            require: true,
        },
        version: {
            type: "varchar",
            required: true,
        },
    },
})
