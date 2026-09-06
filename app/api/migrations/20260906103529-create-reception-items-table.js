'use strict';

class CreateReceptionItemsTable {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reception_items', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      reception_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'receptions', key: 'id' },
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
      quantity_received: { type: Sequelize.INTEGER, allowNull: false },
      cartons_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      unit_cost: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });
  }

  async down(queryInterface) {
    await queryInterface.dropTable('reception_items');
  }
}

const createReceptionItemsTable = new CreateReceptionItemsTable();
export default createReceptionItemsTable;
