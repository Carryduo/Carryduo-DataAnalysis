var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "game_info", // Will use table name `category` as default behaviour.
    tableName: "game_info", // Optional: Provide `tableName` property to override the default behaviour for table name.
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
        gameCount: {
            type: "int",
            require: true,
        },
        version: {
            type: "varchar",
        },
    },
})
