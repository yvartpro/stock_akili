'use strict';

class CreateDamagedRecordsTable {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('damaged_records', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' },
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
      status: {
        type: Sequelize.ENUM('endommage', 'perdu', 'hors_service'),
        allowNull: false
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      reason: { type: Sequelize.TEXT, allowNull: false },
      date: { type: Sequelize.DATEONLY, allowNull: false, defaultValue: Sequelize.NOW },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });
  }

  async down(queryInterface) {
    await queryInterface.dropTable('damaged_records');
  }
}

const createDamagedRecordsTable = new CreateDamagedRecordsTable();
export default createDamagedRecordsTable;
