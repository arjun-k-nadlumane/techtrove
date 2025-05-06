const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 8081,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/techtrove',
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  SERVICE_REGISTRY_URL: process.env.SERVICE_REGISTRY_URL || 'http://localhost:8080'
};