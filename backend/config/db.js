const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // This line reaches into your .env file and grabs the secret link
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`🔴 MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Shuts down the server if the database fails to connect
  }
};

module.exports = connectDB;