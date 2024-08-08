import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTableModule1723002999737 implements MigrationInterface {
    name = 'UpdateTableModule1723002999737'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "modules" DROP CONSTRAINT "FK_a6637494664d871968306442f3b"`);
        await queryRunner.query(`ALTER TABLE "modules" DROP COLUMN "parentId"`);
        await queryRunner.query(`ALTER TABLE "modules" DROP COLUMN "parent_id"`);
        await queryRunner.query(`ALTER TABLE "modules" ADD "parent_id" uuid`);
        await queryRunner.query(`ALTER TABLE "modules" ADD CONSTRAINT "FK_a1bd9c21d7179d0b411dbaf9a55" FOREIGN KEY ("parent_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "modules" DROP CONSTRAINT "FK_a1bd9c21d7179d0b411dbaf9a55"`);
        await queryRunner.query(`ALTER TABLE "modules" DROP COLUMN "parent_id"`);
        await queryRunner.query(`ALTER TABLE "modules" ADD "parent_id" character varying`);
        await queryRunner.query(`ALTER TABLE "modules" ADD "parentId" uuid`);
        await queryRunner.query(`ALTER TABLE "modules" ADD CONSTRAINT "FK_a6637494664d871968306442f3b" FOREIGN KEY ("parentId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
