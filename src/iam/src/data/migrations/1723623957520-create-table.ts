import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTable1723623957520 implements MigrationInterface {
    name = 'CreateTable1723623957520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_15604bad1f93cd0d82045c6ca9b"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_15604bad1f93cd0d82045c6ca9b" FOREIGN KEY ("login_token_id") REFERENCES "tokens"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_15604bad1f93cd0d82045c6ca9b"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_15604bad1f93cd0d82045c6ca9b" FOREIGN KEY ("login_token_id") REFERENCES "tokens"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
