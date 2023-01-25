var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "champ_ban", // Will use table name `category` as default behaviour.
    tableName: "champ_ban", // Optional: Provide `tableName` property to override the default behaviour for table name.
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
        },
        banCount: {
            type: "int",
            default: 0,
        },
        version: {
            type: "varchar",
        },
    },
})
