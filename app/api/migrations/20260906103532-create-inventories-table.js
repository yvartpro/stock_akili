'use strict';

class CreateInventoriesTable {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventories', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      inventory_number: { type: Sequelize.STRING, allowNull: false, unique: true },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('en_cours', 'valide'),
        allowNull: false,
        defaultValue: 'en_cours'
      },
      observation: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });
  }

  async down(queryInterface) {
    await queryInterface.dropTable('inventories');
  }
}

const createInventoriesTable = new CreateInventoriesTable();
export default createInventoriesTable;
