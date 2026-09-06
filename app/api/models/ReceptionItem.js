import { Model, DataTypes } from 'sequelize';

export default class ReceptionItem extends Model {
  static associate(Reception, Product) {
    ReceptionItem.belongsTo(Reception, { foreignKey: 'receptionId', as: 'reception' });
    ReceptionItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
  }
  static initModel(sequelize) {
    ReceptionItem.init({
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      quantityReceived: { type: DataTypes.INTEGER, allowNull: false },
      cartonsCount: { type: DataTypes.INTEGER, defaultValue: 1 },
      unitCost: { type: DataTypes.FLOAT, defaultValue: 0 }
    }, {
      sequelize,
      modelName: 'ReceptionItem',
      tableName: 'reception_items',
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  }
}