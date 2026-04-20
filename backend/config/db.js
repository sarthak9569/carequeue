const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if Atlas is unreachable
    });
    console.log(`CareQueue Cloud Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.warn('Backend starting in NO-DB mode. Check your internet connection for MongoDB Atlas.');
  }
};

module.exports = connectDB;
