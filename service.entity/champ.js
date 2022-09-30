
var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "CHAMP", // Will use table name `category` as default behaviour.
    tableName: "CHAMP", // Optional: Provide `tableName` property to override the default behaviour for table name.
    columns: {
        champId: {
            type: 'varchar',
            primary: true,
        },
        champ_name_ko: {
            type: 'varchar',
            require: true
        },
        champ_name_en: {
            type: 'varchar',
            require: true
        },
        champ_img: {
            type: 'varchar',
            require: true
        },
        win_rate: {
            type: 'int',
            require: false
        },
        ban_rate: {
            type: 'int',
            require: false
        },
        pick_rate: {
            type: 'int',
            require: false
        },
    },
    relations: {
        champId: {
            target: 'COMBINATION_STAT',
            type: 'one-to-many',
            joinColumn: ['mainChampId', 'subChampId'],
            cascade: true,
            eager: true,
            inverseSide: 'CHAMP',
        },
    }
})