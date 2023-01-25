var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "SIMULATION", // Will use table name `category` as default behaviour.
    tableName: "SIMULATION", // Optional: Provide `tableName` property to override the default behaviour for table name.
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
        category: {
            type: "int",
            require: true,
        },
        winrate: {
            type: "float",
            precision: 7,
            scale: 4,
            require: true,
        },
        sample_num: {
            type: "int",
            require: true,
        },
        champ1Id: {
            type: "int",
            require: true,
        },
        champ2Id: {
            type: "int",
            require: true,
        },
        champ3Id: {
            type: "int",
            require: true,
        },
        champ4Id: {
            type: "int",
            require: true,
        },
        version: {
            type: "varchar",
            require: true,
        },
    },
    relations: {
        champ1Id: {
            target: "CHAMP",
            type: "many-to-one",
            joinColumn: {
                name: "champ1Id",
                referencedColumnName: "champId",
            },
        },
        champ2Id: {
            target: "CHAMP",
            type: "many-to-one",
            joinColumn: {
                name: "champ2Id",
                referencedColumnName: "champId",
            },
        },
        champ3Id: {
            target: "CHAMP",
            type: "many-to-one",
            joinColumn: {
                name: "champ3Id",
                referencedColumnName: "champId",
            },
        },
        champ4Id: {
            target: "CHAMP",
            type: "many-to-one",
            joinColumn: {
                name: "champ4Id",
                referencedColumnName: "champId",
            },
        },
    },
})
