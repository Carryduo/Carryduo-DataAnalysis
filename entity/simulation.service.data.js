
var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "simulation_service", // Will use table name `category` as default behaviour.
    tableName: "simulation_service", // Optional: Provide `tableName` property to override the default behaviour for table name.
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
        category: {
            type: 'int',
            require: true
        },
        winrate: {
            type: 'decimal',
            precision: 7,
            scale: 4,
            require: true
        },
        sample_num: {
            type: 'int',
            require: true
        },
        champ1Id: {
            type: 'int',
            require: true
        },
        champ1Name: {
            type: 'varchar',
            require: true
        },
        champ2Id: {
            type: 'int',
            require: true
        },
        champ2Name: {
            type: 'varchar',
            require: true
        },
        champ3Id: {
            type: 'int',
            require: true
        },
        champ3Name: {
            type: 'varchar',
            require: true
        },
        champ4Id: {
            type: 'int',
            require: true
        },
        champ4Name: {
            type: 'varchar',
            require: true
        },
        version: {
            type: 'varchar',
            required: true
        }
    },
})