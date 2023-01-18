var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "champ_pick", // Will use table name `category` as default behaviour.
    tableName: "champ_pick", // Optional: Provide `tableName` property to override the default behaviour for table name.
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
        pickCount: {
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
