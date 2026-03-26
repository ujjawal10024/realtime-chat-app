const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,

    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },

    referralCode: String,
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);