import { DataTypes, Model } from 'sequelize';

export default class Inventory extends Model {
  static associate(InventoryItem, User) {
    Inventory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Inventory.hasMany(InventoryItem, { foreignKey: 'inventoryId', as: 'items', onDelete: 'CASCADE' });
  }
  static initModel(sequelize) {
    Inventory.init({
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      inventoryNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      status: { 
        type: DataTypes.ENUM('en_cours', 'valide'), 
        defaultValue: 'en_cours',
        allowNull: false 
      },
      observation: { type: DataTypes.TEXT, allowNull: true }
    }, {
      sequelize,
      modelName: 'Inventory',
      tableName: 'inventories',
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  }
}