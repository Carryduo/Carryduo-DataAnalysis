var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "summonerid", // Will use table name `category` as default behaviour.
    tableName: "summonerid", // Optional: Provide `tableName` property to override the default behaviour for table name.
    columns: {
        id: {
            type: 'varchar',
            primary: true,
            generated: 'uuid',
        },
        summonerId: {
            type: "varchar",
            require: true,
            unique: true
        },
        tier: {
            type: "varchar",
            require: true
        },
        division: {
            type: "varchar",
            require: true
        }
    },
})