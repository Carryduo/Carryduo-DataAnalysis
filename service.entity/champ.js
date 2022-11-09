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
        win_rate: {
            type: "int",
            require: false,
        },
        ban_rate: {
            type: "int",
            require: false,
        },
        pick_rate: {
            type: "int",
            require: false,
        },
        top_rate: {
            type: "int",
            require: false,
        },
        jungle_rate: {
            type: "int",
            require: false,
        },
        mid_rate: {
            type: "int",
            require: false,
        },
        ad_rate: {
            type: "int",
            require: false,
        },
        support_rate: {
            type: "int",
            require: false,
        },
        version: {
            type: "varchar",
            require: true,
        },
    },
    relations: {
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
        champId: {
            target: "SIMULATION",
            type: "one-to-many",
            cascade: true,
            eager: true,
        },
        champId: {
            target: "CHAMPSPELL",
            type: "one-to-many",
            cascade: true,
            eager: true,
        },
    }
}
)
