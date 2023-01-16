const { MigrationInterface, QueryRunner } = require("typeorm")

module.exports = class createPositionCol1673867755148 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE champ_win_rate ADD position VARCHAR(20) DEFAULT "old"`)
        await queryRunner.query(`ALTER TABLE champ_service ADD position VARCHAR(20) DEFAULT "old"`)
        await queryRunner.query(`ALTER TABLE champspell ADD position VARCHAR(20) DEFAULT "old"`)
        await queryRunner.query(`ALTER TABLE champspell_service ADD position VARCHAR(20) DEFAULT "old"`)
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE champ_win_rate DROP COLUMN position`)
        await queryRunner.query(`ALTER TABLE champ_service DROP COLUMN position`)
        await queryRunner.query(`ALTER TABLE champspell DROP COLUMN position`)
        await queryRunner.query(`ALTER TABLE champspell_service DROP COLUMN position`)
    }
}
