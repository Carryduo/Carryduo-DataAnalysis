var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "CHAMP", // Will use table name `category` as default behaviour.
    tableName: "CHAMP", // Optional: Provide `tableName` property to override the default behaviour for table name.
    columns: {
        champId: {
            type: "varchar",
            primary: true,
        },
        champ_name_ko: {
            type: "varchar",
            require: true,
        },
        champ_name_en: {
            type: "varchar",
            require: true,
        },
        champ_main_img: {
            type: "varchar",
            require: true,
        },
        champ_img: {
            type: "varchar",
            require: true,
        },
    },
    relations: {
        //수정
        champ_rate: {
            target: "CHAMP_RATE",
            type: "one-to-many",
            cascade: true,
            eager: true,
        },
        champ_ban: {
            target: "CHAMP_BAN",
            type: "one-to-many",
            cascade: true,
            eager: true,
        },
        champ_spell: {
            target: "CHAMP_SPELL",
            type: "one-to-many",
            cascade: true,
            eager: true,
        },
        //기존
        champrate: {
            target: "CHAMPRATE",
            type: "one-to-many",
            cascade: true,
            eager: true,
        },
        combination: {
            target: "COMBINATION_STAT",
            type: "one-to-many",
            cascade: true,
            eager: true,
        },
        simulation: {
            target: "SIMULATION",
            type: "one-to-many",
            cascade: true,
            eager: true,
        },
        spell: {
            target: "CHAMPSPELL",
            type: "one-to-many",
            cascade: true,
            eager: true,
        },
    },
})
