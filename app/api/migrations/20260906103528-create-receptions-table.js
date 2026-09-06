'use strict';

class CreateReceptionsTable {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('receptions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      reception_number: { type: Sequelize.STRING, allowNull: false, unique: true },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      time: { type: Sequelize.STRING, allowNull: false },
      supplier_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'suppliers', key: 'id' },
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
      total_cartons: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      observation: { type: Sequelize.TEXT, allowNull: true },
      status: {
        type: Sequelize.ENUM('validee', 'brouillon'),
        allowNull: false,
        defaultValue: 'validee'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });
  }

  async down(queryInterface) {
    await queryInterface.dropTable('receptions');
  }
}

const createReceptionsTable = new CreateReceptionsTable();
export default createReceptionsTable;
