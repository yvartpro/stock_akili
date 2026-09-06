import { Model, DataTypes } from 'sequelize';

export default class Supplier extends Model {
  static associate(Reception) {
    Supplier.hasMany(Reception, { foreignKey: 'supplierId', as: 'receptions' });
  }
  static initModel(sequelize) {
    Supplier.init({
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      code: { type: DataTypes.STRING, allowNull: false, unique: true },
      name: { type: DataTypes.STRING, allowNull: false },
      contactName: { type: DataTypes.STRING, allowNull: true },
      phone: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: true },
      address: { type: DataTypes.TEXT, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      active: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, {
      sequelize,
      modelName: 'Supplier',
      tableName: 'suppliers',
      timestamps: true,
      paranoid: true,
      underscored: true
    }); 
  }
}