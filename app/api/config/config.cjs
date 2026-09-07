const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

function buildConfig() {
  return {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
  };
}

const shared = buildConfig();

module.exports = {
  development: shared,
  test: shared,
  production: shared,
};
