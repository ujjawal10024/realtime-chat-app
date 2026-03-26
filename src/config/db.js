const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/chat-app");
    console.log("🔥 MongoDB Connected");
  } catch (error) {
    console.log("Mongo Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;