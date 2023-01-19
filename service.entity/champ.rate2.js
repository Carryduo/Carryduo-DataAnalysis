var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "CHAMP_RATE", // Will use table name `category` as default behaviour.
    tableName: "CHAMP_RATE", // Optional: Provide `tableName` property to override the default behaviour for table name.
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
        win: {
            type: "int",
        },
        lose: {
            type: "int",
        },
        position: {
            type: "varchar",
        },
        pickCount: {
            type: "int",
        },
        version: {
            type: "varchar",
        },
    },
    relations: {
        champId: {
            target: "CHAMP",
            type: "many-to-one",
            joinColumn: {
                name: "champId",
                referencedColumnName: "champId",
            },
        },
    },
})
