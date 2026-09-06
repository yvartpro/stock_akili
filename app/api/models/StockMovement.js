import { Model, DataTypes } from 'sequelize';

export default class StockMovement extends Model {
  static associate(Product, User) {
    StockMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
    StockMovement.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  }
  static initModel(sequelize) {
    StockMovement.init({
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      type: {
        type: DataTypes.ENUM(
          'ENTREE_RECEPTION',
          'SORTIE_SHOP',
          'AJUSTEMENT_INVENTAIRE',
          'CHANGEMENT_STATUT'
        ),
        allowNull: false
      },
      reference: { type: DataTypes.STRING, allowNull: false },
      quantityChange: { type: DataTypes.INTEGER, allowNull: false },
      previousStock: { type: DataTypes.INTEGER, allowNull: false },
      newStock: { type: DataTypes.INTEGER, allowNull: false },
      reason: { type: DataTypes.TEXT, allowNull: true }
    }, {
      sequelize,
      modelName: 'StockMovement',
      tableName: 'stock_movements',
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  }
}