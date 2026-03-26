const Message = require("../models/Message");

// ✅ SEND MESSAGE
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;

    const senderId = req.user.id;

    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: "ReceiverId and message required",
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: message, // 🔥 FIXED
    });

    res.status(201).json(newMessage); // simple return
  } catch (error) {
    console.log("SendMessage Error:", error.message);
    next(error);
  }
};

// ✅ GET CHAT HISTORY
const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const myId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages); // simple return
  } catch (error) {
    console.log("GetMessages Error:", error.message);
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMessages,
};