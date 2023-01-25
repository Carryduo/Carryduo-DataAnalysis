var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "champ_spell", // Will use table name `category` as default behaviour.
    tableName: "champ_spell", // Optional: Provide `tableName` property to override the default behaviour for table name.
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
        playCount: {
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
