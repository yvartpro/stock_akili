import { Model, DataTypes } from 'sequelize';


export default class ExitVoucherItem extends Model {
  static associate(ExitVoucher, Product) {
    ExitVoucherItem.belongsTo(ExitVoucher, { foreignKey: 'exitVoucherId', as: 'exitVoucher' });
    ExitVoucherItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
  }
  static initModel(sequelize) {
    ExitVoucherItem.init({
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      quantity: { type: DataTypes.INTEGER, allowNull: false }
    }, {
      sequelize,
      modelName: 'ExitVoucherItem',
      tableName: 'exit_voucher_items',
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  }
}