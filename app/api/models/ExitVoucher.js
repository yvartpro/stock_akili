import { Model, DataTypes } from 'sequelize';

export default class ExitVoucher extends Model {
  static associate(ExitVoucherItem, Shop, User) {
    ExitVoucher.hasMany(ExitVoucherItem, { foreignKey: 'exitVoucherId', as: 'items' });
    ExitVoucher.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });
    ExitVoucher.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  }
  static initModel(sequelize) {
    ExitVoucher.init({
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      voucherNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      time: { type: DataTypes.STRING, allowNull: false },
      observation: { type: DataTypes.TEXT, allowNull: true },
      status: { 
        type: DataTypes.ENUM('valide', 'brouillon'), 
        defaultValue: 'valide',
        allowNull: false 
      }
    },{
      sequelize,
      modelName: 'ExitVoucher',
      tableName: 'exit_vouchers',
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  }
}