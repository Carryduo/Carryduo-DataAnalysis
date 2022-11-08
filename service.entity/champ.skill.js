var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "CHAMPSKILLINFO", // Will use table name `category` as default behaviour.
    tableName: "CHAMPSKILLINFO", // Optional: Provide `tableName` property to override the default behaviour for table name.
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
        skill_id: {
            type: "varchar",
        },
        skill_name: {
            type: "varchar",
        },
        skill_img: {
            type: "varchar",
        },
        champId: {
            type: "varchar",
        },
        skill_tool_tip: {
            type: "varchar",
        },
        skill_desc: {
            type: "varchar",
        },
    },
})
