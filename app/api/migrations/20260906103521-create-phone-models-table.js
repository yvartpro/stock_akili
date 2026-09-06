'use strict';

class CreatePhoneModelsTable {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('phone_models', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      brand_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'brands', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });
  }

  async down(queryInterface) {
    await queryInterface.dropTable('phone_models');
  }
};

const createPhoneModelsTable = new CreatePhoneModelsTable();
export default createPhoneModelsTable;