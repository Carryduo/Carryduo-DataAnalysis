var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "CHAMPRATE", // Will use table name `category` as default behaviour.
    tableName: "CHAMPRATE", // Optional: Provide `tableName` property to override the default behaviour for table name.
    columns: {
        id: {
            type: "varchar",
            primary: true,
            generated: "uuid",
        },
        champId: {
            type: "varchar",
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
