var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "GAME_INFO", // Will use table name `category` as default behaviour.
    tableName: "GAME_INFO", // Optional: Provide `tableName` property to override the default behaviour for table name.
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
        deleted_at: {
            type: "timestamp",
            require: false,
            default: null,
        },
        game_count: {
            type: "int",
            require: true,
        },
        version: {
            type: "varchar",
        },
    },
})
