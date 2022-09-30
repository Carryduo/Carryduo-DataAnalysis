
var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "combination_service", // Will use table name `category` as default behaviour.
    tableName: "combination_service", // Optional: Provide `tableName` property to override the default behaviour for table name.
    columns: {
        id: {
            type: 'varchar',
            primary: true,
            generated: 'uuid',
        },
        created_at: {
            type: 'timestamp',
            require: true,
            default: () => { return `NOW()` }
        },
        updated_at: {
            type: 'timestamp',
            require: true,
            default: () => { return `NOW()` }
        },
        tier: {
            type: 'int',
            requre: true,
            default: 0
        },
        category: {
            type: 'int',
            require: true
        },
        rank_in_category: {
            type: 'int',
            require: true,
            default: 0
        },
        winrate: {
            type: 'decimal',
            require: true
        },
        sample_num: {
            type: 'int',
            require: true
        },
        mainChampId: {
            type: 'varchar',
            require: true
        },
        subChampId: {
            type: 'varchar',
            require: true
        }
    },
})