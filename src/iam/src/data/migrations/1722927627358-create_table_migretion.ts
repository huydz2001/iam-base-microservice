import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableMigretion1722927627358 implements MigrationInterface {
  name = 'CreateTableMigretion1722927627358';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."permisions_type_enum" AS ENUM('1', '2', '3', '4')`,
    );
    await queryRunner.query(
      `CREATE TABLE "permisions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "created_by" character varying NOT NULL, "updated_by" character varying NOT NULL, "is_deleted" boolean NOT NULL, "deleted_by" character varying, "type" "public"."permisions_type_enum" NOT NULL, "desc" character varying NOT NULL, "module_id" uuid, CONSTRAINT "PK_496458b9ce3a297e65ac3333f7f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_496458b9ce3a297e65ac3333f7" ON "permisions" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "modules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "created_by" character varying NOT NULL, "updated_by" character varying NOT NULL, "is_deleted" boolean NOT NULL, "deleted_by" character varying, "name" character varying NOT NULL, "desc" character varying, "parent_id" uuid, CONSTRAINT "PK_7dbefd488bd96c5bf31f0ce0c95" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7dbefd488bd96c5bf31f0ce0c9" ON "modules" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "created_by" character varying NOT NULL, "updated_by" character varying NOT NULL, "is_deleted" boolean NOT NULL, "deleted_by" character varying, "name" character varying NOT NULL, "desc" character varying, CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_659d1483316afb28afd3a90646" ON "groups" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "access_Token" character varying NOT NULL, "refresh_token" character varying NOT NULL, "type" integer NOT NULL, "expires" TIMESTAMP NOT NULL, "blacklisted" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL, CONSTRAINT "UQ_8769073e38c365f315426554ca5" UNIQUE ("user_id"), CONSTRAINT "REL_8769073e38c365f315426554ca" UNIQUE ("user_id"), CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3001e89ada36263dabf1fb6210" ON "tokens" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_loginToken_refreshToken" ON "tokens" ("refresh_token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_loginToken_accessToken" ON "tokens" ("access_Token") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_loginToken_uId" ON "tokens" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "created_by" character varying NOT NULL, "updated_by" character varying NOT NULL, "is_deleted" boolean NOT NULL, "deleted_by" character varying, "user_name" character varying, "full_name" character varying, "gender" integer, "dob" date, "image" character varying, "user_id" uuid, CONSTRAINT "REL_9e432b7df0d182f8d292902d1a" UNIQUE ("user_id"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8e520eb4da7dc01d0e190447c8" ON "profiles" ("id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_profile_userName" ON "profiles" ("user_name") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('1', '2', '0')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "created_by" character varying NOT NULL, "updated_by" character varying NOT NULL, "is_deleted" boolean NOT NULL, "deleted_by" character varying, "email" character varying NOT NULL, "phone" character varying NOT NULL, "hash_pass" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT '1', "is_verify_email" boolean NOT NULL DEFAULT false, "group_id" uuid, "login_token_id" uuid, CONSTRAINT "REL_15604bad1f93cd0d82045c6ca9" UNIQUE ("login_token_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a3ffb1c0c8416b9fc6f907b743" ON "users" ("id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_user_phone" ON "users" ("phone") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_user_email" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "groups_modules" ("group_id" uuid NOT NULL, "module_id" uuid NOT NULL, CONSTRAINT "PK_c7724aa8bce1da4f4b196ad3ca7" PRIMARY KEY ("group_id", "module_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_495104682d0031fd759d2a15d3" ON "groups_modules" ("group_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_54917bb77799cf01748c912a2b" ON "groups_modules" ("module_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "permisions" ADD CONSTRAINT "FK_005d2c64c2265fb090df71798cd" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "modules" ADD CONSTRAINT "FK_a1bd9c21d7179d0b411dbaf9a55" FOREIGN KEY ("parent_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" ADD CONSTRAINT "FK_8769073e38c365f315426554ca5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_b8d62b3714f81341caa13ab0ff0" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_15604bad1f93cd0d82045c6ca9b" FOREIGN KEY ("login_token_id") REFERENCES "tokens"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups_modules" ADD CONSTRAINT "FK_495104682d0031fd759d2a15d30" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups_modules" ADD CONSTRAINT "FK_54917bb77799cf01748c912a2bb" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "groups_modules" DROP CONSTRAINT "FK_54917bb77799cf01748c912a2bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups_modules" DROP CONSTRAINT "FK_495104682d0031fd759d2a15d30"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_15604bad1f93cd0d82045c6ca9b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_b8d62b3714f81341caa13ab0ff0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" DROP CONSTRAINT "FK_8769073e38c365f315426554ca5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "modules" DROP CONSTRAINT "FK_a1bd9c21d7179d0b411dbaf9a55"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permisions" DROP CONSTRAINT "FK_005d2c64c2265fb090df71798cd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_54917bb77799cf01748c912a2b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_495104682d0031fd759d2a15d3"`,
    );
    await queryRunner.query(`DROP TABLE "groups_modules"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_email"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_phone"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a3ffb1c0c8416b9fc6f907b743"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_profile_userName"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8e520eb4da7dc01d0e190447c8"`,
    );
    await queryRunner.query(`DROP TABLE "profiles"`);
    await queryRunner.query(`DROP INDEX "public"."idx_loginToken_uId"`);
    await queryRunner.query(`DROP INDEX "public"."idx_loginToken_accessToken"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_loginToken_refreshToken"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3001e89ada36263dabf1fb6210"`,
    );
    await queryRunner.query(`DROP TABLE "tokens"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_659d1483316afb28afd3a90646"`,
    );
    await queryRunner.query(`DROP TABLE "groups"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7dbefd488bd96c5bf31f0ce0c9"`,
    );
    await queryRunner.query(`DROP TABLE "modules"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_496458b9ce3a297e65ac3333f7"`,
    );
    await queryRunner.query(`DROP TABLE "permisions"`);
    await queryRunner.query(`DROP TYPE "public"."permisions_type_enum"`);
  }
}
