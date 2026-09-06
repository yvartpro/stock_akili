'use strict';

class CreateBrandsTable {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('brands', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });
  }

  async down(queryInterface) {
    await queryInterface.dropTable('brands');
  }
};

const createBrandsTable = new CreateBrandsTable();
export default createBrandsTable;