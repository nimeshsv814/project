const dotenv = require('dotenv');

dotenv.config();

const ENV = {
  PORT: Number(process.env.PORT || 5000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-deployment-failure',
  JWT_SECRET: process.env.JWT_SECRET || 'unsafe-development-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  PROMETHEUS_BASE_URL: process.env.PROMETHEUS_BASE_URL || 'http://localhost:9090',
  ML_SERVICE_BASE_URL: process.env.ML_SERVICE_BASE_URL || 'http://localhost:8000',
  KUBECTL_NAMESPACE: process.env.KUBECTL_NAMESPACE || 'default',
  RABBITMQ_URL: process.env.RABBITMQ_URL || ''
};

module.exports = { ENV };
