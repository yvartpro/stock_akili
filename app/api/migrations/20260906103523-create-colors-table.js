'use strict';

class CreateColorsTable {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('colors', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      hex_code: { type: Sequelize.STRING, allowNull: false, defaultValue: '#64748b' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });
  }

  async down(queryInterface) {
    await queryInterface.dropTable('colors');
  }
};

const createColorsTable = new CreateColorsTable();
export default createColorsTable;