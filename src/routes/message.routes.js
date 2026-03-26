const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getMessages,
} = require("../controllers/message.controller");

const authMiddleware = require("../middleware/auth.middleware");

// ✅ SEND
router.post("/send", authMiddleware, sendMessage);

// ✅ GET CHAT
router.get("/:userId", authMiddleware, getMessages);

module.exports = router;