var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "champspell", // Will use table name `category` as default behaviour.
    tableName: "champspell", // Optional: Provide `tableName` property to override the default behaviour for table name.
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
        spell1: {
            type: "varchar",
            require: true,
        },
        spell2: {
            type: "varchar",
            require: true,
        },
        champId: {
            type: "varchar",
            require: true,
        },
        champName: {
            type: "varchar",
            require: true,
        },
        sampleNum: {
            type: "int",
            require: true,
            default: 0,
        },
        version: {
            type: "varchar",
        },
        position: {
            type: "varchar",
        },
    },
})
