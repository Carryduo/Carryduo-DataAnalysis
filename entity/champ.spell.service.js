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
        pickRate: {
            type: "int",
            require: true,
            default: 0,
        },
        sampleNum: {
            type: "int",
            require: true,
            default: 0,
        },
    },
})
