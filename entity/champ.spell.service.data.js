var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "champspell_service", // Will use table name `category` as default behaviour.
    tableName: "champspell_service", // Optional: Provide `tableName` property to override the default behaviour for table name.
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
        champId: {
            type: "int",
            require: true,
            default: 0,
        },
        spell1: {
            type: "int",
            default: 0,
        },
        spell2: {
            type: "int",
            default: 0,
        },
        pick_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 0,
        },
        sample_num: {
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
