import { Model, DataTypes } from 'sequelize';

export default class User extends Model {
  static associate(Reception, ExitVoucher, Inventory, StockMovement, AuditLog, DamagedRecord) {
    User.hasMany(Reception, { foreignKey: 'userId', as: 'receptions' });
    User.hasMany(ExitVoucher, { foreignKey: 'userId', as: 'exitVouchers' });
    User.hasMany(Inventory, { foreignKey: 'userId', as: 'inventories' });
    User.hasMany(StockMovement, { foreignKey: 'userId', as: 'movements' });
    User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
    User.hasMany(DamagedRecord, { foreignKey: 'userId', as: 'damagedRecords' });
  }
  static initModel(sequelize) {
    User.init({
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      role: { 
        type: DataTypes.ENUM('admin', 'gestionnaire'), 
        defaultValue: 'gestionnaire',
        allowNull: false 
      },
      active: { type: DataTypes.BOOLEAN, defaultValue: true },
      lastLogin: { type: DataTypes.DATE, allowNull: true }
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  }
}