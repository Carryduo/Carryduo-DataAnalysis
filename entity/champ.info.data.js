
var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "champinfo", // Will use table name `category` as default behaviour.
    tableName: "champinfo", // Optional: Provide `tableName` property to override the default behaviour for table name.
    columns: {
        id: {
            type: 'varchar',
            primary: true,
            generated: 'uuid',
        },
        champId: {
            type: "int",
            require: true
        },
        champNaME: {
            type: "varchar",
            require: true
        },
        win: {
            type: "int",
            require: true,
            default: 0
        },
        lose: {
            type: "int",
            require: true,
            default: 0
        },
        sampleNum: {
            type: "int",
            require: true,
            default: 0
        },
    },
})