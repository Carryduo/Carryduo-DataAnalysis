var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "CHAMPSPELL", // Will use table name `category` as default behaviour.
    tableName: "CHAMPSPELL", // Optional: Provide `tableName` property to override the default behaviour for table name.
    columns: {
        id: {
            type: "varchar",
            primary: true,
            generated: "uuid",
        },
        created_at: {
            type: "timestamp",
            require: true,
            default: () => {
                return `NOW()`
            },
        },
        updated_at: {
            type: "timestamp",
            require: true,
            default: () => {
                return `NOW()`
            },
        },
        spell1: {
            type: "int",
            require: true,
        },
        spell2: {
            type: "int",
            require: true,
        },
        champId: {
            type: "int",
            require: true,
        },
        pick_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            require: true,
        },
        sample_num: {
            type: "int",
            require: true,
            default: 0,
        },
        version: {
            type: "varchar",
        },
    },
})
