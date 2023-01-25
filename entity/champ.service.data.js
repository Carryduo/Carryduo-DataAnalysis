var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "champ_service", // Will use table name `category` as default behaviour.
    tableName: "champ_service", // Optional: Provide `tableName` property to override the default behaviour for table name.
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
        win_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 0,
        },
        ban_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 0,
        },
        pick_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 0,
        },
        top_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 0,
        },
        jungle_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 0,
        },
        mid_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 0,
        },
        ad_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 0,
        },
        support_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
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
