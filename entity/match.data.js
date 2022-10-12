var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "matchdata", // Will use table name `category` as default behaviour.
    tableName: "matchdata", // Optional: Provide `tableName` property to override the default behaviour for table name.
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
                return `NOW()`
            },
        },
        updatedAt: {
            type: "timestamp",
            require: true,
            default: () => {
                return `NOW()`
            },
        },
        tier: {
            type: "varchar",
        },
        division: {
            type: "varchar",
        },
        matchId: {
            type: "varchar",
            require: true,
        },
        matchData: {
            type: "json",
            require: true,
        },
        analyzed: {
            type: "int",
            require: true,
            default: 0,
        },
        rateAnalyzed: {
            type: "int",
            require: true,
            default: 0,
        },
        banAnalyzed: {
            type: "int",
            require: true,
            default: 0,
        },
        positionAnalyzed: {
            type: "int",
            require: true,
            default: 0,
        },
        spellAnalyzed: {
            type: "int",
            require: true,
            default: 0,
        },
        simulationAnalyzed: {
            type: "int",
            require: true,
            default: 0,
        },
    },
})
