import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1723628618113 implements MigrationInterface {
    name = 'UpdateTable1723628618113'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "groups_permissions" DROP CONSTRAINT "FK_47bf6007bfde3928fc923ee3d51"`);
        await queryRunner.query(`ALTER TABLE "groups_permissions" ADD CONSTRAINT "FK_47bf6007bfde3928fc923ee3d51" FOREIGN KEY ("permission_id") REFERENCES "permisions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "groups_permissions" DROP CONSTRAINT "FK_47bf6007bfde3928fc923ee3d51"`);
        await queryRunner.query(`ALTER TABLE "groups_permissions" ADD CONSTRAINT "FK_47bf6007bfde3928fc923ee3d51" FOREIGN KEY ("permission_id") REFERENCES "permisions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
