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
        },
        win_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            require: true,
        },
        ban_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            require: true,
        },
        pick_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            require: true,
        },
        top_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            require: true,
        },
        jungle_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            require: true,
        },
        mid_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            require: true,
        },
        ad_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            require: true,
        },
        support_rate: {
            type: "decimal",
            precision: 5,
            scale: 2,
            require: true,
        },
        version: {
            type: "varchar",
        },
    },
})
