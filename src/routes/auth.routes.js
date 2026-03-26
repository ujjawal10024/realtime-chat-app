const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  addFriend,
  getFriends,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");

const { getMe } = require("../controllers/auth.controller");

// AUTH
router.post("/register", registerUser);
router.post("/login", loginUser);

// FRIEND SYSTEM
router.post("/add-friend", authMiddleware, addFriend);
router.get("/friends", authMiddleware, getFriends);

//referall
router.get("/me", authMiddleware, getMe);
module.exports = router;