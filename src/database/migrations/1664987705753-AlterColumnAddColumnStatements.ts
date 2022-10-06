import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AlterColumnAddColumnStatements1664987705753
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TYPE statements_type_enum ADD VALUE IF NOT EXISTS 'transfer' AFTER 'withdraw'"
    );

    await queryRunner.addColumn("statements", new TableColumn({
      name: "sender_id",
      type: "uuid",
      isNullable: true
    }));

    await queryRunner.createForeignKey(
      'statements',
      new TableForeignKey({
        name: 'usersSenderStatements',
        columnNames: ['sender_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('statements', 'usersSenderStatements');

    await queryRunner.dropColumn('statements', 'sender_id');
  }
}
