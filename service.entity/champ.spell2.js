var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "CHAMP_SPELL", // Will use table name `category` as default behaviour.
    tableName: "CHAMP_SPELL", // Optional: Provide `tableName` property to override the default behaviour for table name.
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
        spell1: {
            type: "int",
            require: true,
        },
        spell2: {
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
