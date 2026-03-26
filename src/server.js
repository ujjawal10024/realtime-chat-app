require("dotenv").config();

const connectDB = require("./config/db");
const app = require("./app");

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

// ✅ CONNECT DATABASE
connectDB();

// ✅ CREATE SERVER
const server = http.createServer(app);

// ✅ SOCKET SETUP
const io = new Server(server, {
  cors: {
    origin: "https://realtime-chat-app-phi-blush.vercel.app",
    methods: ["GET", "POST"],
  },
});

// ✅ SOCKET LOGIC
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // 🔥 JOIN ROOM
  socket.on("join_room", (userId) => {
    socket.join(String(userId));
    console.log(`📥 User joined room: ${userId}`);
  });

  // 🔥 SEND MESSAGE
  socket.on("send_message", (data) => {
    console.log("📤 Message received:", data);

    const { receiverId } = data;

    // 🔥 SEND TO RECEIVER ROOM
    io.to(String(receiverId)).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// ✅ START SERVER
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});