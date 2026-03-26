const express = require("express");
const cors = require("cors");

const app = express();

// ✅ CORS (LOCAL + PRODUCTION)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://realtime-chat-app-phi-blush.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ✅ Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/messages", require("./routes/message.routes"));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API Running ✅");
});

module.exports = app;