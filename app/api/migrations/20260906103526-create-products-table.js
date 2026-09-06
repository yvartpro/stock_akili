'use strict';

class CreateProductsTable {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      sku: { type: Sequelize.STRING, allowNull: false, unique: true },
      name: { type: Sequelize.STRING, allowNull: false },
      category: {
        type: Sequelize.ENUM('pochette', 'protection'),
        allowNull: false
      },
      protection_type: { type: Sequelize.STRING, allowNull: true },
      brand_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'brands', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      model_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'phone_models', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      color_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'colors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      current_stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      min_stock_threshold: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 15
      },
      unit_cost: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      unit_price: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      status: {
        type: Sequelize.ENUM('disponible', 'endommage', 'perdu', 'hors_service'),
        allowNull: false,
        defaultValue: 'disponible'
      },
      status_reason: { type: Sequelize.TEXT, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });
  }

  async down(queryInterface) {
    await queryInterface.dropTable('products');
  }
};

const createProductsTable = new CreateProductsTable();
export default createProductsTable;