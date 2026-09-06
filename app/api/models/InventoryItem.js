import { Model, DataTypes } from 'sequelize';

export default class InventoryItem extends Model {
  static associate(Inventory, Product) {
    InventoryItem.belongsTo(Inventory, { foreignKey: 'inventoryId', as: 'inventory' });
    InventoryItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
  }
  static initModel(sequelize) {
    InventoryItem.init({
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      theoreticalStock: { type: DataTypes.INTEGER, allowNull: false },
      physicalStock: { type: DataTypes.INTEGER, allowNull: false },
      difference: { type: DataTypes.INTEGER, allowNull: false },
      justification: { type: DataTypes.TEXT, allowNull: true },
      adjustmentApplied: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, {
      sequelize,
      modelName: 'InventoryItem',
      tableName: 'inventory_items',
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  }
}