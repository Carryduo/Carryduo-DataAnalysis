var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "COMBINATION_STAT", // Will use table name `category` as default behaviour.
    tableName: "COMBINATION_STAT", // Optional: Provide `tableName` property to override the default behaviour for table name.
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
        sample_num: {
            type: "int",
            require: true,
        },
        mainChampId: {
            type: "varchar",
            require: true,
        },
        subChampId: {
            type: "varchar",
            require: true,
        },
        version: {
            type: 'varchar',
            require: true
        }
    },
    relations: {
        mainChampId: {
            target: 'CHAMP',
            type: 'many-to-one',
            joinColumn: {
                name: 'mainChampId',
                referencedColumnName: 'champId'
            },
        },
        subChampId: {
            target: 'CHAMP',
            type: 'many-to-one',
            joinColumn: {
                name: 'subChampId',
                referencedColumnName: 'champId'
            },
        }
    }
})
