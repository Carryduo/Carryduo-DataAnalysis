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
            type: "int",
        },
        ban_rate: {
            type: "int",
        },
        pick_rate: {
            type: "int",
        },
        top_rate: {
            type: "int",
        },
        jungle_rate: {
            type: "int",
        },
        mid_rate: {
            type: "int",
        },
        ad_rate: {
            type: "int",
        },
        support_rate: {
            type: "int",
        },
        version: {
            type: "varchar",
        },
    },
    relations: {
        champId: {
            target: 'CHAMP',
            type: 'one-to-one',
            joinColumn: {
                name: 'champId',
                referencedColumnName: 'champId'
            },
        }
    }
})
