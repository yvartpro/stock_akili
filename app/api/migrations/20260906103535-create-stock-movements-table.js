'use strict';

class CreateStockMovementsTable {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock_movements', {
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
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      type: {
        type: Sequelize.ENUM(
          'ENTREE_RECEPTION',
          'SORTIE_SHOP',
          'AJUSTEMENT_INVENTAIRE',
          'CHANGEMENT_STATUT'
        ),
        allowNull: false
      },
      reference: { type: Sequelize.STRING, allowNull: false },
      quantity_change: { type: Sequelize.INTEGER, allowNull: false },
      previous_stock: { type: Sequelize.INTEGER, allowNull: false },
      new_stock: { type: Sequelize.INTEGER, allowNull: false },
      reason: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });
  }

  async down(queryInterface) {
    await queryInterface.dropTable('stock_movements');
  }
}

const createStockMovementsTable = new CreateStockMovementsTable();
export default createStockMovementsTable;
