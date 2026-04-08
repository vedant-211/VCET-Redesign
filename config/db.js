require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    
    // Masking URI for safer logging
    const maskedUri = uri.replace(/\/\/.*@/, '//****:****@');
    console.log(`Attempting to connect to MongoDB: ${maskedUri}`);
    
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    throw err; // Propagate error to server.js
  }
};

module.exports = connectDB;
