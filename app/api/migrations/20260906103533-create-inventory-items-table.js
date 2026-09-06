'use strict';

class CreateInventoryItemsTable {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventory_items', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      inventory_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'inventories', key: 'id' },
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
      theoretical_stock: { type: Sequelize.INTEGER, allowNull: false },
      physical_stock: { type: Sequelize.INTEGER, allowNull: false },
      difference: { type: Sequelize.INTEGER, allowNull: false },
      justification: { type: Sequelize.TEXT, allowNull: true },
      adjustment_applied: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });
  }

  async down(queryInterface) {
    await queryInterface.dropTable('inventory_items');
  }
}

const createInventoryItemsTable = new CreateInventoryItemsTable();
export default createInventoryItemsTable;
