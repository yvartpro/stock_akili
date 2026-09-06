import { Model, DataTypes } from 'sequelize';

export default class PhoneModel extends Model {
  static associate(Brand, Product) {
    PhoneModel.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' });
    PhoneModel.hasMany(Product, { foreignKey: 'modelId', as: 'products' });
  }
  static initModel(sequelize) {
    PhoneModel.init({
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false }
    }, {
      sequelize,
      modelName: 'PhoneModel',
      tableName: 'phone_models',
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  }
}