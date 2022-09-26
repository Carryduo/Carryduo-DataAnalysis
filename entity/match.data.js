
var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "matchdata", // Will use table name `category` as default behaviour.
    tableName: "matchdata", // Optional: Provide `tableName` property to override the default behaviour for table name.
    columns: {
        id: {
            type: 'varchar',
            primary: true,
            generated: 'uuid',
        },
        tier: {
            type: "varchar"
        },
        division: {
            type: "varchar",
        },
        matchId: {
            type: "varchar",
            require: true
        },
        matchData: {
            type: "json",
            require: true
        }
    },
})