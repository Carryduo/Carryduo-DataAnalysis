var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "CHAMPINFO", // Will use table name `category` as default behaviour.
    tableName: "CHAMPINFO", // Optional: Provide `tableName` property to override the default behaviour for table name.
    columns: {
        id: {
            type: "varchar",
            primary: true,
            generated: "uuid",
        },
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
})
