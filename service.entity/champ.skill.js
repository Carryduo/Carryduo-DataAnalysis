var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "CHAMPSKILL", // Will use table name `category` as default behaviour.
  tableName: "CHAMPSKILL", // Optional: Provide `tableName` property to override the default behaviour for table name.
  columns: {
    id: {
      type: "varchar",
      primary: true,
      generated: "uuid",
    },
    createdAt: {
      type: "timestamp",
      require: true,
      default: () => {
        return `NOW()`;
      },
    },
    updatedAt: {
      type: "timestamp",
      require: true,
      default: () => {
        return `NOW()`;
      },
    },
    skillId: {
      type: "varchar",
    },
    skillName: {
      type: "varchar",
    },
    skillName: {
      type: "varchar",
    },
    skillToolTip: {
      type: "varchar",
    },
    skillImg: {
      type: "varchar",
    },
    champId: {
      type: "varchar",
    },
  },
});
