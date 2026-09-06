'use strict';

class CreateExitVoucherItemsTable {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exit_voucher_items', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      exit_voucher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'exit_vouchers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });
  }

  async down(queryInterface) {
    await queryInterface.dropTable('exit_voucher_items');
  }
}

const createExitVoucherItemsTable = new CreateExitVoucherItemsTable();
export default createExitVoucherItemsTable;
