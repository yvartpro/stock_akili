import { Model, DataTypes } from 'sequelize';

export default class Brand extends Model {
  static associate(PhoneModel, Product) {
    Brand.hasMany(PhoneModel, { foreignKey: 'brandId', as: 'models' });
    Brand.hasMany(Product, { foreignKey: 'brandId', as: 'products' });
  }
  static initModel(sequelize) {
    Brand.init({
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false, unique: true }
    }, {
      sequelize,
      modelName: 'Brand',
      tableName: 'brands',
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  }
}