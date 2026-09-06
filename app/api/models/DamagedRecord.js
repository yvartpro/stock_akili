import { Model, DataTypes } from 'sequelize';

export default class DamagedRecord extends Model {
  static associate(Product, User) {
    DamagedRecord.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
    DamagedRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  }
  static initModel(sequelize) {
    DamagedRecord.init({
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      status: {
        type: DataTypes.ENUM('endommage', 'perdu', 'hors_service'),
        allowNull: false
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      reason: { type: DataTypes.TEXT, allowNull: false },
      date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW }
    }, {
      sequelize,
      modelName: 'DamagedRecord',
      tableName: 'damaged_records',
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  }
}