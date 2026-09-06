import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

import User from './User.js';
import Brand from './Brand.js';
import PhoneModel from './PhoneModel.js';
import Color from './Color.js';
import Product from './Product.js';
import Supplier from './Supplier.js';
import Shop from './Shop.js';
import Reception from './Reception.js';
import ReceptionItem from './ReceptionItem.js';
import ExitVoucher from './ExitVoucher.js';
import ExitVoucherItem from './ExitVoucherItem.js';
import Inventory from './Inventory.js';
import InventoryItem from './InventoryItem.js';
import StockMovement from './StockMovement.js';
import AuditLog from './AuditLog.js';
import DamagedRecord from './DamagedRecord.js';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql'
  }
);

User.initModel(sequelize);
Brand.initModel(sequelize);
PhoneModel.initModel(sequelize);
Color.initModel(sequelize);
Product.initModel(sequelize);
Supplier.initModel(sequelize);
Shop.initModel(sequelize);
Reception.initModel(sequelize);
ReceptionItem.initModel(sequelize);
ExitVoucher.initModel(sequelize);
ExitVoucherItem.initModel(sequelize);
Inventory.initModel(sequelize);
InventoryItem.initModel(sequelize);
StockMovement.initModel(sequelize);
AuditLog.initModel(sequelize);
DamagedRecord.initModel(sequelize);

User.associate(Reception, ExitVoucher, Inventory, StockMovement, AuditLog, DamagedRecord);
Supplier.associate(Reception);
Shop.associate(ExitVoucher);
Brand.associate(PhoneModel, Product);
PhoneModel.associate(Brand, Product);
Color.associate(Product);
Product.associate(Brand, PhoneModel, Color, ReceptionItem, ExitVoucherItem, InventoryItem, StockMovement, DamagedRecord);
Reception.associate(Supplier, ReceptionItem, User);
ReceptionItem.associate(Reception, Product);
ExitVoucher.associate(ExitVoucherItem, Shop, User);
ExitVoucherItem.associate(ExitVoucher, Product);
Inventory.associate(InventoryItem, User);
InventoryItem.associate(Inventory, Product);
StockMovement.associate(Product, User);
AuditLog.associate(User);
DamagedRecord.associate(Product, User);

export {
  sequelize,
  User,
  Brand,
  PhoneModel,
  Color,
  Product,
  Supplier,
  Shop,
  Reception,
  ReceptionItem,
  ExitVoucher,
  ExitVoucherItem,
  Inventory,
  InventoryItem,
  StockMovement,
  AuditLog,
  DamagedRecord
};