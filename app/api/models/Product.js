import { Model, DataTypes } from 'sequelize';

export default class Product extends Model {
  static associate(Brand, PhoneModel, Color, ReceptionItem, ExitVoucherItem, InventoryItem, StockMovement, DamagedRecord) {
    Product.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' });
    Product.belongsTo(PhoneModel, { foreignKey: 'modelId', as: 'phoneModel' });
    Product.belongsTo(Color, { foreignKey: 'colorId', as: 'color' });

    Product.hasMany(ReceptionItem, { foreignKey: 'productId', as: 'receptionItems' });
    Product.hasMany(ExitVoucherItem, { foreignKey: 'productId', as: 'exitItems' });
    Product.hasMany(InventoryItem, { foreignKey: 'productId', as: 'inventoryItems' });
    Product.hasMany(StockMovement, { foreignKey: 'productId', as: 'movements' });
    Product.hasMany(DamagedRecord, { foreignKey: 'productId', as: 'damagedRecords' });
  }
  static initModel(sequelize) {
    Product.init({
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      sku: { type: DataTypes.STRING, allowNull: false, unique: true },
      name: { type: DataTypes.STRING, allowNull: false },
      category: { 
        type: DataTypes.ENUM('pochette', 'protection'), 
        allowNull: false 
      },
      protectionType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      currentStock: { 
        type: DataTypes.INTEGER, 
        defaultValue: 0,
        allowNull: false,
        validate: { min: 0 }
      },
      minStockThreshold: { 
        type: DataTypes.INTEGER, 
        defaultValue: 15,
        allowNull: false 
      },
      unitCost: { type: DataTypes.FLOAT, defaultValue: 0 },
      unitPrice: { type: DataTypes.FLOAT, defaultValue: 0 },
      status: {
        type: DataTypes.ENUM('disponible', 'endommage', 'perdu', 'hors_service'),
        defaultValue: 'disponible',
        allowNull: false
      },
      statusReason: { type: DataTypes.TEXT, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true }
    }, {
      sequelize,
      modelName: 'Product',
      tableName: 'products',
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  }
}