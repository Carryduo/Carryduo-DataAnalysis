const { PrimaryGeneratedColumn } = require("typeorm")

var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "matchid", // Will use table name `category` as default behaviour.
    tableName: "matchid", // Optional: Provide `tableName` property to override the default behaviour for table name.
    columns: {
        id: {
            type: 'varchar',
            primary: true,
            generated: 'uuid',
        },
        createdAt: {
            type: 'timestamp',
            require: true,
            default: () => { return `NOW()` }
        },
        updatedAt: {
            type: 'timestamp',
            require: true,
            default: () => { return `NOW()` }
        },
        summonerId: {
            type: "varchar",
            require: true,
        },
        matchId: {
            type: "varchar",
            require: true,
            unique: true
        },
        puuid: {
            type: "varchar",
            require: true,
        },
        tier: {
            type: "varchar",
            require: true,
        },
        division: {
            type: "varchar",
            require: true
        },
        analyzed: {
            type: "int",
            require: true,
            default: 0
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
    },
})