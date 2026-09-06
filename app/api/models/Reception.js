import { Model, DataTypes } from 'sequelize';

export default class Reception extends Model {
  static associate(Supplier, ReceptionItem, User) {
    Reception.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
    Reception.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Reception.hasMany(ReceptionItem, { foreignKey: 'receptionId', as: 'items', onDelete: 'CASCADE' });
  }
  static initModel(sequelize) {
    Reception.init({
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      receptionNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      time: { type: DataTypes.STRING, allowNull: false },
      totalCartons: { type: DataTypes.INTEGER, defaultValue: 1 },
      observation: { type: DataTypes.TEXT, allowNull: true },
      status: { 
        type: DataTypes.ENUM('validee', 'brouillon'), 
        defaultValue: 'validee',
        allowNull: false 
      }
    },{
      sequelize,
      modelName: 'Reception',
      tableName: 'receptions',
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  }
}