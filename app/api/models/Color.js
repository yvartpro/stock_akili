import { Model, DataTypes } from 'sequelize';

export default class Color extends Model {
  static associate(Product) {
    Color.hasMany(Product, { foreignKey: 'colorId', as: 'products' });
  }
  static initModel(sequelize) {
    Color.init({
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      hexCode: { type: DataTypes.STRING, defaultValue: '#64748b' }
    }, {
      sequelize,
      modelName: 'Color',
      tableName: 'colors',
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  }
}