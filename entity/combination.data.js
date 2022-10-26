
var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "combination", // Will use table name `category` as default behaviour.
    tableName: "combination", // Optional: Provide `tableName` property to override the default behaviour for table name.
    columns: {
        id: {
            type: 'varchar',
            primary: true,
            generated: 'uuid',
        },
        createdAt: {
            type: 'timestamp',
            require: true,
            default: () => { return `NOW()` }
        },
        updatedAt: {
            type: 'timestamp',
            require: true,
            default: () => { return `NOW()` }
        },
        matchId: {
            type: "varchar",
            require: true
        },
        mainChampId: {
            type: "varchar",
            require: true
        },
        mainChampName: {
            type: "varchar",
            require: true
        },
        subChampId: {
            type: "varchar",
            require: true
        },
        subChampName: {
            type: "varchar",
            require: true
        },
        win: {
            type: "int",
            require: true,
            default: 0
        },
        lose: {
            type: 'int',
            require: true,
            default: 0
        },
        sampleNum: {
            type: 'int',
            require: true,
            default: 0
        },
        category: {
            type: 'int',
            require: true
        },
        version: {
            type: 'varchar',
            required: true
        }
    },
})