import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sequelize;

const useMySQL = Boolean(process.env.MYSQL_DATABASE || process.env.DATABASE_URL);

if (useMySQL) {
  if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'mysql',
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
    });
  } else {
    sequelize = new Sequelize(
      process.env.MYSQL_DATABASE,
      process.env.MYSQL_USER || 'root',
      process.env.MYSQL_PASSWORD || '',
      {
        host: process.env.MYSQL_HOST || 'localhost',
        port: Number(process.env.MYSQL_PORT) || 3306,
        dialect: 'mysql',
        logging: false,
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
      }
    );
  }
} else {
  // SQLite fallback ensures seamless out-of-the-box local operation
  const dbPath = path.resolve(__dirname, '../../../aps_warehouse.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  });
}

export { sequelize };

export async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log(`[Database] Connected successfully via ${sequelize.getDialect().toUpperCase()}`);

    // Import models and associations
    const { initModels, seedInitialData } = await import('../models.old/index.js');
    await initModels();

    // Sync models
    await sequelize.sync({ alter: true });
    console.log('[Database] Schema synchronized');

    // Seed realistic data if database is fresh
    await seedInitialData();
  } catch (error) {
    console.error('[Database] Connection or sync error:', error);
    // If MySQL failed, fallback to SQLite
    if (sequelize.getDialect() !== 'sqlite') {
      console.log('[Database] Falling back to SQLite for local session stability...');
      const fallbackPath = path.resolve(__dirname, '../../../aps_warehouse.sqlite');
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: fallbackPath,
        logging: false,
      });
      await sequelize.authenticate();
      const { initModels, seedInitialData } = await import('../models.old/index.js');
      await initModels();
      await sequelize.sync({ alter: true });
      await seedInitialData();
    }
  }
}
