const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class combinationSimulation1666848097806 {
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE combination ADD COLUMN version VARCHAR(255) NOT NULL DEFAULT "old"')
        await queryRunner.query('ALTER TABLE combination_service ADD COLUMN version VARCHAR(255) NOT NULL DEFAULT "old"')
        await queryRunner.query('ALTER TABLE simulation ADD COLUMN version VARCHAR(255) NOT NULL DEFAULT "old"')
        await queryRunner.query('ALTER TABLE simulation_service ADD COLUMN version VARCHAR(255) NOT NULL DEFAULT "old"')
    }

    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE combination DROP COLUMN version')
        await queryRunner.query('ALTER TABLE combination_service DROP COLUMN version')
        await queryRunner.query('ALTER TABLE simulation DROP COLUMN version')
        await queryRunner.query('ALTER TABLE simulation_service DROP COLUMN version')
    }

}
