const mongoose = require('mongoose');
const { ENV } = require('./env');

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(ENV.MONGODB_URI);
  console.log('MongoDB connected');
}

module.exports = { connectDB };
