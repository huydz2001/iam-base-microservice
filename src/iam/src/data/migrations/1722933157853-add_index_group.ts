import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexGroup1722933157853 implements MigrationInterface {
  name = 'AddIndexGroup1722933157853';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_group_name" ON "groups" ("name") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_group_name"`);
  }
}
