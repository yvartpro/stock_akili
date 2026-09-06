import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config.old/db.js';

// Define Models
export const User = sequelize.define('User', {
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
});

export const Supplier = sequelize.define('Supplier', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  contactName: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

export const Shop = sequelize.define('Shop', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  managerName: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

export const Brand = sequelize.define('Brand', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true }
});

export const PhoneModel = sequelize.define('PhoneModel', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false }
});

export const Color = sequelize.define('Color', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  hexCode: { type: DataTypes.STRING, defaultValue: '#64748b' }
});

export const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  sku: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { 
    type: DataTypes.ENUM('pochette', 'protection'), 
    allowNull: false 
  },
  protectionType: {
    type: DataTypes.STRING, // e.g., 'Verre Trempé 9D', 'Film Hydrogel Ultra', 'Céramique Mat', 'Privacy Anti-Espion'
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
});

export const Reception = sequelize.define('Reception', {
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
});

export const ReceptionItem = sequelize.define('ReceptionItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  quantityReceived: { type: DataTypes.INTEGER, allowNull: false },
  cartonsCount: { type: DataTypes.INTEGER, defaultValue: 1 },
  unitCost: { type: DataTypes.FLOAT, defaultValue: 0 }
});

export const ExitVoucher = sequelize.define('ExitVoucher', {
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
});

export const ExitVoucherItem = sequelize.define('ExitVoucherItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false }
});

export const Inventory = sequelize.define('Inventory', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  inventoryNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { 
    type: DataTypes.ENUM('en_cours', 'valide'), 
    defaultValue: 'en_cours',
    allowNull: false 
  },
  observation: { type: DataTypes.TEXT, allowNull: true }
});

export const InventoryItem = sequelize.define('InventoryItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  theoreticalStock: { type: DataTypes.INTEGER, allowNull: false },
  physicalStock: { type: DataTypes.INTEGER, allowNull: false },
  difference: { type: DataTypes.INTEGER, allowNull: false },
  justification: { type: DataTypes.TEXT, allowNull: true },
  adjustmentApplied: { type: DataTypes.BOOLEAN, defaultValue: false }
});

export const StockMovement = sequelize.define('StockMovement', {
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
});

export const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userName: { type: DataTypes.STRING, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false },
  entityType: { type: DataTypes.STRING, allowNull: false },
  entityId: { type: DataTypes.STRING, allowNull: true },
  details: { type: DataTypes.TEXT, allowNull: true },
  ipAddress: { type: DataTypes.STRING, defaultValue: '127.0.0.1' }
});

export const DamagedRecord = sequelize.define('DamagedRecord', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  status: {
    type: DataTypes.ENUM('endommage', 'perdu', 'hors_service'),
    allowNull: false
  },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  reason: { type: DataTypes.TEXT, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW }
});

// Setup Associations
export function initModels() {
  // Brand & Model
  Brand.hasMany(PhoneModel, { foreignKey: 'brandId', as: 'models' });
  PhoneModel.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' });

  // Product Associations
  Brand.hasMany(Product, { foreignKey: 'brandId', as: 'products' });
  Product.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' });

  PhoneModel.hasMany(Product, { foreignKey: 'modelId', as: 'products' });
  Product.belongsTo(PhoneModel, { foreignKey: 'modelId', as: 'phoneModel' });

  Color.hasMany(Product, { foreignKey: 'colorId', as: 'products' });
  Product.belongsTo(Color, { foreignKey: 'colorId', as: 'color' });

  // Reception
  Supplier.hasMany(Reception, { foreignKey: 'supplierId', as: 'receptions' });
  Reception.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

  User.hasMany(Reception, { foreignKey: 'userId', as: 'receptions' });
  Reception.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  Reception.hasMany(ReceptionItem, { foreignKey: 'receptionId', as: 'items', onDelete: 'CASCADE' });
  ReceptionItem.belongsTo(Reception, { foreignKey: 'receptionId' });

  Product.hasMany(ReceptionItem, { foreignKey: 'productId', as: 'receptionItems' });
  ReceptionItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  // Exit Voucher
  Shop.hasMany(ExitVoucher, { foreignKey: 'shopId', as: 'exitVouchers' });
  ExitVoucher.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });

  User.hasMany(ExitVoucher, { foreignKey: 'userId', as: 'exitVouchers' });
  ExitVoucher.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  ExitVoucher.hasMany(ExitVoucherItem, { foreignKey: 'exitVoucherId', as: 'items', onDelete: 'CASCADE' });
  ExitVoucherItem.belongsTo(ExitVoucher, { foreignKey: 'exitVoucherId' });

  Product.hasMany(ExitVoucherItem, { foreignKey: 'productId', as: 'exitItems' });
  ExitVoucherItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  // Inventory
  User.hasMany(Inventory, { foreignKey: 'userId', as: 'inventories' });
  Inventory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  Inventory.hasMany(InventoryItem, { foreignKey: 'inventoryId', as: 'items', onDelete: 'CASCADE' });
  InventoryItem.belongsTo(Inventory, { foreignKey: 'inventoryId' });

  Product.hasMany(InventoryItem, { foreignKey: 'productId', as: 'inventoryItems' });
  InventoryItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  // Movements & Audit
  Product.hasMany(StockMovement, { foreignKey: 'productId', as: 'movements' });
  StockMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  User.hasMany(StockMovement, { foreignKey: 'userId', as: 'movements' });
  StockMovement.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
  AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Damaged Records
  Product.hasMany(DamagedRecord, { foreignKey: 'productId', as: 'damagedRecords' });
  DamagedRecord.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  User.hasMany(DamagedRecord, { foreignKey: 'userId', as: 'damagedRecords' });
  DamagedRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });
}

// Seed Initial realistic data for APS
export async function seedInitialData() {
  const usersCount = await User.count();
  if (usersCount > 0) return; // already seeded

  console.log('[Seed] Seeding initial database records for APS Stock Principal...');

  // Hash default passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('gestionnaire123', 10);

  // 1. Users (RDC Context)
  const adminUser = await User.create({
    name: 'Christian Kabamba (Admin)',
    email: 'admin@aps.cd',
    password: adminPassword,
    role: 'admin',
    active: true
  });

  const managerUser = await User.create({
    name: 'Grace Tshilombo (Gestionnaire)',
    email: 'gestionnaire@aps.cd',
    password: managerPassword,
    role: 'gestionnaire',
    active: true
  });

  // Also create alias logins for demo access with @aps.com so existing login buttons work seamlessly
  await User.create({
    name: 'Christian Kabamba (Admin)',
    email: 'admin@aps.com',
    password: adminPassword,
    role: 'admin',
    active: true
  });

  await User.create({
    name: 'Grace Tshilombo (Gestionnaire)',
    email: 'gestionnaire@aps.com',
    password: managerPassword,
    role: 'gestionnaire',
    active: true
  });

  // 2. Suppliers (Fournisseurs - RDC & Importateurs agréés)
  const sup1 = await Supplier.create({
    code: 'FOURN-01',
    name: 'Congo Mobile Import SARL',
    contactName: 'M. Patrick Kasongo',
    phone: '+243 81 234 5678',
    email: 'contact@congomobile-import.cd',
    address: '142 Boulevard du 30 Juin, Gombe, Kinshasa, RDC',
    notes: 'Fournisseur principal de verres trempés 9D et protections hydrogel haute résistance'
  });

  const sup2 = await Supplier.create({
    code: 'FOURN-02',
    name: 'Kinshasa Tech Distribution (KTD)',
    contactName: 'Mme Chantal Ilunga',
    phone: '+243 99 876 5432',
    email: 'commandes@kintech-distrib.cd',
    address: 'Avenue des Poids Lourds, Limete Industriel, Kinshasa, RDC',
    notes: 'Pochettes silicone MagSafe, étuis renforcés antichoc et cuir'
  });

  const sup3 = await Supplier.create({
    code: 'FOURN-03',
    name: 'Grand Katanga Accessoires SARL',
    contactName: 'M. Serge Mwamba',
    phone: '+243 82 345 6789',
    email: 'lubumbashi@katangaccessoires.cd',
    address: 'Avenue Kilela Balanda, Centre-Ville, Lubumbashi, RDC',
    notes: 'Fournisseur direct pour filtres Privacy anti-espion et protections céramique'
  });

  // 3. Shops (Points de vente destinataires en RDC)
  const shop1 = await Shop.create({
    code: 'SHOP-01',
    name: 'Shop APS Gombe - Boulevard',
    managerName: 'M. Dieudonné Kabamba',
    location: 'Boulevard du 30 Juin, Immeuble Royale, Gombe, Kinshasa',
    phone: '+243 81 555 0101'
  });

  const shop2 = await Shop.create({
    code: 'SHOP-02',
    name: 'Shop APS Victoire - Kasa-Vubu',
    managerName: 'Mme Nadine Tshilombo',
    location: 'Rond-Point Victoire, Face Stade Tata Raphaël, Kasa-Vubu, Kinshasa',
    phone: '+243 82 555 0202'
  });

  const shop3 = await Shop.create({
    code: 'SHOP-03',
    name: 'Shop APS Limete - 7ème Rue',
    managerName: 'M. Junior Mutombo',
    location: 'Place Commerciale, 7ème Rue Résidentiel, Limete, Kinshasa',
    phone: '+243 99 555 0303'
  });

  const shop4 = await Shop.create({
    code: 'SHOP-04',
    name: 'Shop APS Lubumbashi Centre',
    managerName: 'Mme Dorcas Kalala',
    location: 'Avenue Mobutu, Face Galerie Hypnose, Lubumbashi',
    phone: '+243 85 555 0404'
  });

  // 4. Brands & Models
  const brandApple = await Brand.create({ name: 'Apple' });
  const brandSamsung = await Brand.create({ name: 'Samsung' });
  const brandXiaomi = await Brand.create({ name: 'Xiaomi' });
  const brandPixel = await Brand.create({ name: 'Google' });

  const mIp16PM = await PhoneModel.create({ name: 'iPhone 16 Pro Max', brandId: brandApple.id });
  const mIp16P = await PhoneModel.create({ name: 'iPhone 16 Pro', brandId: brandApple.id });
  const mIp15 = await PhoneModel.create({ name: 'iPhone 15', brandId: brandApple.id });
  const mIp14 = await PhoneModel.create({ name: 'iPhone 14', brandId: brandApple.id });

  const mS25U = await PhoneModel.create({ name: 'Galaxy S25 Ultra', brandId: brandSamsung.id });
  const mS24 = await PhoneModel.create({ name: 'Galaxy S24', brandId: brandSamsung.id });
  const mA55 = await PhoneModel.create({ name: 'Galaxy A55 5G', brandId: brandSamsung.id });

  const mRedmi13 = await PhoneModel.create({ name: 'Redmi Note 13 Pro', brandId: brandXiaomi.id });
  const mPixel9P = await PhoneModel.create({ name: 'Pixel 9 Pro XL', brandId: brandPixel.id });

  // 5. Colors
  const colBlack = await Color.create({ name: 'Noir Mat / Midnight', hexCode: '#0f172a' });
  const colTitanium = await Color.create({ name: 'Titane Naturel', hexCode: '#94a3b8' });
  const colClear = await Color.create({ name: 'Transparent Cristallin', hexCode: '#e2e8f0' });
  const colNavy = await Color.create({ name: 'Bleu Pacifique / Nuit', hexCode: '#1e3a8a' });
  const colEmerald = await Color.create({ name: 'Vert Émeraude', hexCode: '#065f46' });
  const colPurple = await Color.create({ name: 'Violet Profond', hexCode: '#581c87' });

  // 6. Products: Phone Cases (Pochettes) & Anti-Break Protections (Protections anti-casse) - Prix en Franc Congolais (FC)
  const products = await Product.bulkCreate([
    // Pochettes
    {
      sku: 'POCH-IP16PM-BLCK',
      name: 'Pochette Silicone MagSafe iPhone 16 Pro Max Noir',
      category: 'pochette',
      brandId: brandApple.id,
      modelId: mIp16PM.id,
      colorId: colBlack.id,
      currentStock: 140,
      minStockThreshold: 30,
      unitCost: 9500,
      unitPrice: 28000,
      status: 'disponible'
    },
    {
      sku: 'POCH-IP16PM-TITN',
      name: 'Pochette Antichoc Armor iPhone 16 Pro Max Titane',
      category: 'pochette',
      brandId: brandApple.id,
      modelId: mIp16PM.id,
      colorId: colTitanium.id,
      currentStock: 18, // near threshold
      minStockThreshold: 25,
      unitCost: 11500,
      unitPrice: 32000,
      status: 'disponible'
    },
    {
      sku: 'POCH-IP16P-CLR',
      name: 'Pochette Transparente Hybride iPhone 16 Pro',
      category: 'pochette',
      brandId: brandApple.id,
      modelId: mIp16P.id,
      colorId: colClear.id,
      currentStock: 8, // critical alert
      minStockThreshold: 20,
      unitCost: 8000,
      unitPrice: 22000,
      status: 'disponible'
    },
    {
      sku: 'POCH-IP15-NAVY',
      name: 'Pochette Cuir Véritable iPhone 15 Bleu Nuit',
      category: 'pochette',
      brandId: brandApple.id,
      modelId: mIp15.id,
      colorId: colNavy.id,
      currentStock: 65,
      minStockThreshold: 15,
      unitCost: 14000,
      unitPrice: 38000,
      status: 'disponible'
    },
    {
      sku: 'POCH-S25U-BLCK',
      name: 'Pochette Rigide Fibre Carbone Galaxy S25 Ultra Noir',
      category: 'pochette',
      brandId: brandSamsung.id,
      modelId: mS25U.id,
      colorId: colBlack.id,
      currentStock: 85,
      minStockThreshold: 20,
      unitCost: 11000,
      unitPrice: 30000,
      status: 'disponible'
    },
    {
      sku: 'POCH-A55-EMRLD',
      name: 'Pochette Bumper Renforcé Galaxy A55 Vert',
      category: 'pochette',
      brandId: brandSamsung.id,
      modelId: mA55.id,
      colorId: colEmerald.id,
      currentStock: 4, // critical alert
      minStockThreshold: 15,
      unitCost: 6500,
      unitPrice: 18000,
      status: 'disponible'
    },
    // Protections Anti-Casse
    {
      sku: 'PROT-IP16PM-9D-CLR',
      name: 'Verre Trempé 9D Bords Incurvés iPhone 16 Pro Max',
      category: 'protection',
      brandId: brandApple.id,
      modelId: mIp16PM.id,
      colorId: colClear.id,
      protectionType: 'Verre Trempé 9D',
      currentStock: 320,
      minStockThreshold: 50,
      unitCost: 3500,
      unitPrice: 12000,
      status: 'disponible'
    },
    {
      sku: 'PROT-IP16PM-PRIV',
      name: 'Protection Anti-Espion Privacy iPhone 16 Pro Max',
      category: 'protection',
      brandId: brandApple.id,
      modelId: mIp16PM.id,
      colorId: colBlack.id,
      protectionType: 'Privacy Anti-Espion',
      currentStock: 75,
      minStockThreshold: 25,
      unitCost: 5500,
      unitPrice: 18000,
      status: 'disponible'
    },
    {
      sku: 'PROT-S25U-HYDR-CLR',
      name: 'Film Hydrogel Auto-Cicatrisant Galaxy S25 Ultra',
      category: 'protection',
      brandId: brandSamsung.id,
      modelId: mS25U.id,
      colorId: colClear.id,
      protectionType: 'Film Hydrogel Ultra',
      currentStock: 190,
      minStockThreshold: 40,
      unitCost: 4500,
      unitPrice: 15000,
      status: 'disponible'
    },
    {
      sku: 'PROT-S24-CERAM-MAT',
      name: 'Protection Céramique Incassable Mate Galaxy S24',
      category: 'protection',
      brandId: brandSamsung.id,
      modelId: mS24.id,
      colorId: colBlack.id,
      protectionType: 'Céramique Mat',
      currentStock: 12, // low stock
      minStockThreshold: 25,
      unitCost: 5000,
      unitPrice: 16500,
      status: 'disponible'
    },
    {
      sku: 'PROT-REDMI13-9D',
      name: 'Verre Trempé 9D Haute Définition Redmi Note 13',
      category: 'protection',
      brandId: brandXiaomi.id,
      modelId: mRedmi13.id,
      colorId: colClear.id,
      protectionType: 'Verre Trempé 9D',
      currentStock: 110,
      minStockThreshold: 30,
      unitCost: 2800,
      unitPrice: 10000,
      status: 'disponible'
    },
    {
      sku: 'PROT-PIXEL9P-HYDR',
      name: 'Protection Hydrogel Intégrale Pixel 9 Pro XL',
      category: 'protection',
      brandId: brandPixel.id,
      modelId: mPixel9P.id,
      colorId: colClear.id,
      protectionType: 'Film Hydrogel Ultra',
      currentStock: 45,
      minStockThreshold: 15,
      unitCost: 4800,
      unitPrice: 15500,
      status: 'disponible'
    }
  ]);

  // 7. Initial Reception (REC-2026-001)
  const rec1 = await Reception.create({
    receptionNumber: 'REC-2026-001',
    date: '2026-08-20',
    time: '09:30',
    supplierId: sup1.id,
    userId: managerUser.id,
    totalCartons: 12,
    observation: 'Livraison conteneur aérien Kinshasa N\'djili, emballages intacts.',
    status: 'validee'
  });

  await ReceptionItem.bulkCreate([
    {
      receptionId: rec1.id,
      productId: products[6].id, // PROT-IP16PM-9D-CLR
      quantityReceived: 200,
      cartonsCount: 4,
      unitCost: 3500
    },
    {
      receptionId: rec1.id,
      productId: products[8].id, // PROT-S25U-HYDR-CLR
      quantityReceived: 150,
      cartonsCount: 3,
      unitCost: 4500
    }
  ]);

  // Initial Reception 2 (REC-2026-002)
  const rec2 = await Reception.create({
    receptionNumber: 'REC-2026-002',
    date: '2026-08-28',
    time: '14:15',
    supplierId: sup2.id,
    userId: managerUser.id,
    totalCartons: 8,
    observation: 'Réception pochettes MagSafe iPhone 16 et Galaxy S25 depuis Limete.',
    status: 'validee'
  });

  await ReceptionItem.bulkCreate([
    {
      receptionId: rec2.id,
      productId: products[0].id, // POCH-IP16PM-BLCK
      quantityReceived: 100,
      cartonsCount: 4,
      unitCost: 9500
    },
    {
      receptionId: rec2.id,
      productId: products[4].id, // POCH-S25U-BLCK
      quantityReceived: 60,
      cartonsCount: 4,
      unitCost: 11000
    }
  ]);

  // 8. Initial Exit Voucher (BS-2026-001)
  const bs1 = await ExitVoucher.create({
    voucherNumber: 'BS-2026-001',
    date: '2026-09-01',
    time: '10:00',
    shopId: shop1.id, // Shop APS Gombe
    userId: managerUser.id,
    observation: 'Approvisionnement hebdomadaire pour Shop Gombe - Boulevard',
    status: 'valide'
  });

  await ExitVoucherItem.bulkCreate([
    {
      exitVoucherId: bs1.id,
      productId: products[0].id,
      quantity: 25
    },
    {
      exitVoucherId: bs1.id,
      productId: products[6].id,
      quantity: 40
    }
  ]);

  // Initial Exit Voucher 2 (BS-2026-002)
  const bs2 = await ExitVoucher.create({
    voucherNumber: 'BS-2026-002',
    date: '2026-09-02',
    time: '15:45',
    shopId: shop2.id, // Shop Victoire
    userId: managerUser.id,
    observation: 'Réapprovisionnement protections Galaxy & pochettes pour Victoire',
    status: 'valide'
  });

  await ExitVoucherItem.bulkCreate([
    {
      exitVoucherId: bs2.id,
      productId: products[8].id,
      quantity: 30
    },
    {
      exitVoucherId: bs2.id,
      productId: products[4].id,
      quantity: 15
    }
  ]);

  // 9. Initial Stock Movements
  await StockMovement.bulkCreate([
    {
      productId: products[0].id,
      type: 'ENTREE_RECEPTION',
      reference: 'REC-2026-002',
      quantityChange: 100,
      previousStock: 65,
      newStock: 165,
      userId: managerUser.id,
      reason: 'Réception fournisseur Kinshasa Tech Distribution (KTD)'
    },
    {
      productId: products[0].id,
      type: 'SORTIE_SHOP',
      reference: 'BS-2026-001',
      quantityChange: -25,
      previousStock: 165,
      newStock: 140,
      userId: managerUser.id,
      reason: 'Sortie vers Shop APS Gombe - Boulevard'
    },
    {
      productId: products[6].id,
      type: 'ENTREE_RECEPTION',
      reference: 'REC-2026-001',
      quantityChange: 200,
      previousStock: 160,
      newStock: 360,
      userId: managerUser.id,
      reason: 'Réception fournisseur Congo Mobile Import SARL'
    },
    {
      productId: products[6].id,
      type: 'SORTIE_SHOP',
      reference: 'BS-2026-001',
      quantityChange: -40,
      previousStock: 360,
      newStock: 320,
      userId: managerUser.id,
      reason: 'Sortie vers Shop APS Gombe - Boulevard'
    }
  ]);

  // 10. Initial Damaged Record (Casse constatée)
  await DamagedRecord.create({
    productId: products[6].id, // PROT-IP16PM-9D-CLR
    status: 'endommage',
    quantity: 5,
    reason: '5 verres trempés fêlés suite à choc lors du déchargement au stock central de Kinshasa',
    date: '2026-09-02',
    userId: managerUser.id
  });

  // 11. Audit Logs
  await AuditLog.bulkCreate([
    {
      userId: adminUser.id,
      userName: 'Christian Kabamba (Admin)',
      action: 'INITIALISATION_SYSTEME',
      entityType: 'System',
      entityId: 'SYS',
      details: 'Démarrage du système APS Stock Principal RDC et initialisation des bases de données',
      ipAddress: '197.157.208.12'
    },
    {
      userId: managerUser.id,
      userName: 'Grace Tshilombo (Gestionnaire)',
      action: 'RECEPTION_VALIDEE',
      entityType: 'Reception',
      entityId: 'REC-2026-001',
      details: 'Validation réception 12 cartons fournisseur Congo Mobile Import SARL',
      ipAddress: '197.157.208.45'
    },
    {
      userId: managerUser.id,
      userName: 'Grace Tshilombo (Gestionnaire)',
      action: 'BON_SORTIE_VALIDE',
      entityType: 'ExitVoucher',
      entityId: 'BS-2026-001',
      details: 'Validation du bon de sortie vers Shop APS Gombe - Boulevard (65 pièces)',
      ipAddress: '197.157.208.45'
    }
  ]);

  console.log('[Seed] Database successfully seeded with rich APS warehouse DRC demo data.');
}
