import { Model, DataTypes } from 'sequelize';

export default class AuditLog extends Model {
  static associate(User) {
    AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  }
  static initModel(sequelize) {
    AuditLog.init({
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userName: { type: DataTypes.STRING, allowNull: false },
      action: { type: DataTypes.STRING, allowNull: false },
      entityType: { type: DataTypes.STRING, allowNull: false },
      entityId: { type: DataTypes.STRING, allowNull: true },
      details: { type: DataTypes.TEXT, allowNull: true },
      ipAddress: { type: DataTypes.STRING, defaultValue: '127.0.0.1' }
    }, {
      sequelize,
      modelName: 'AuditLog',
      tableName: 'audit_logs',
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  }
}