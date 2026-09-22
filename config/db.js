const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student_management";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error (${uri}): ${error.message}`);
    console.warn("\n⚠️ Note: Database is currently disconnected. Please ensure MongoDB Service is running locally.\n");
  }
};

module.exports = connectDB;
