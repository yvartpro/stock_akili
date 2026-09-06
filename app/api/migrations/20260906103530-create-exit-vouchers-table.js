'use strict';

class CreateExitVouchersTable {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exit_vouchers', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      voucher_number: { type: Sequelize.STRING, allowNull: false, unique: true },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      time: { type: Sequelize.STRING, allowNull: false },
      shop_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'shops', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      observation: { type: Sequelize.TEXT, allowNull: true },
      status: {
        type: Sequelize.ENUM('valide', 'brouillon'),
        allowNull: false,
        defaultValue: 'valide'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });
  }

  async down(queryInterface) {
    await queryInterface.dropTable('exit_vouchers');
  }
}

const createExitVouchersTable = new CreateExitVouchersTable();
export default createExitVouchersTable;
