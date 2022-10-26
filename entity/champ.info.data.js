var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "champinfo", // Will use table name `category` as default behaviour.
    tableName: "champinfo", // Optional: Provide `tableName` property to override the default behaviour for table name.
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
        tier: {
            type: "varchar",
        },
        division: {
            type: "varchar",
        },
        champId: {
            type: "int",
            require: true,
        },
        champName: {
            type: "varchar",
            require: true,
        },
        win: {
            type: "int",
            default: 0,
        },
        lose: {
            type: "int",
            default: 0,
        },
        sampleNum: {
            type: "int",
            default: 0,
        },
        banCount: {
            type: "int",
            default: 0,
        },
        top: {
            type: "int",
            default: 0,
        },
        jungle: {
            type: "int",
            default: 0,
        },
        mid: {
            type: "int",
            default: 0,
        },
        ad: {
            type: "int",
            default: 0,
        },
        support: {
            type: "int",
            default: 0,
        },
        version: {
            type: "varchar",
        },
    },
})
